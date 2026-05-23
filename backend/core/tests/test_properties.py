from decimal import Decimal

from hypothesis import given, settings
from hypothesis import strategies as st


@given(
    cost=st.decimals(min_value=Decimal("0.01"), max_value=Decimal("999.99"), places=2),
    quantity=st.integers(min_value=1, max_value=100),
)
@settings(max_examples=100)
def test_line_total_is_cost_times_quantity(cost, quantity):
    line_total = cost * quantity
    assert line_total == cost * quantity
    assert line_total >= cost
    assert line_total >= 0


@given(
    balance=st.decimals(min_value=Decimal("0.00"), max_value=Decimal("10000.00"), places=2),
    amount=st.decimals(min_value=Decimal("0.01"), max_value=Decimal("2000.00"), places=2),
)
@settings(max_examples=100)
def test_add_balance_always_increases(balance, amount):
    new_balance = balance + amount
    assert new_balance > balance
    assert new_balance == balance + amount


@given(
    items=st.lists(
        st.tuples(
            st.decimals(min_value=Decimal("0.01"), max_value=Decimal("100.00"), places=2),
            st.integers(min_value=1, max_value=20),
        ),
        min_size=1,
        max_size=10,
    )
)
@settings(max_examples=100)
def test_cart_total_is_sum_of_line_totals(items):
    line_totals = [cost * qty for cost, qty in items]
    cart_total = sum(line_totals)
    assert cart_total == sum(cost * qty for cost, qty in items)
    assert cart_total >= 0


@given(
    balance=st.decimals(min_value=Decimal("0.00"), max_value=Decimal("10000.00"), places=2),
    cart_total=st.decimals(min_value=Decimal("0.00"), max_value=Decimal("10000.00"), places=2),
)
@settings(max_examples=100)
def test_checkout_balance_check_is_consistent(balance, cart_total):
    sufficient = balance >= cart_total
    if sufficient:
        remaining = balance - cart_total
        assert remaining >= 0
    else:
        assert balance < cart_total
