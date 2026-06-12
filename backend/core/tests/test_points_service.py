from decimal import Decimal

import pytest

from core.services.points_service import calculate_starting_balance


class TestCalculateStartingBalance:
    def test_single_adult_in_catchment(self):
        assert calculate_starting_balance(1, 0, True) == Decimal("58")

    def test_single_adult_out_of_catchment(self):
        assert calculate_starting_balance(1, 0, False) == Decimal("41")

    def test_family_with_children_in_catchment(self):
        assert calculate_starting_balance(2, 3, True) == Decimal("191")
        assert calculate_starting_balance(1, 1, True) == Decimal("91")

    def test_family_with_children_out_of_catchment(self):
        assert calculate_starting_balance(2, 3, False) == Decimal("133")
        assert calculate_starting_balance(1, 1, False) == Decimal("64")

    def test_large_family_in_catchment(self):
        assert calculate_starting_balance(7, 7, True) == Decimal("552")
        assert calculate_starting_balance(4, 4, True) == Decimal("282")

    def test_large_family_out_of_catchment(self):
        assert calculate_starting_balance(7, 7, False) == Decimal("386")
        assert calculate_starting_balance(4, 4, False) == Decimal("197")

    def test_invalid_adults_too_low(self):
        with pytest.raises(ValueError, match="num_adults must be between 1 and 7"):
            calculate_starting_balance(0, 0, True)

    def test_invalid_adults_too_high(self):
        with pytest.raises(ValueError, match="num_adults must be between 1 and 7"):
            calculate_starting_balance(8, 0, True)

    def test_invalid_children_negative(self):
        with pytest.raises(ValueError, match="num_children must be between 0 and 7"):
            calculate_starting_balance(1, -1, True)

    def test_invalid_children_too_high(self):
        with pytest.raises(ValueError, match="num_children must be between 0 and 7"):
            calculate_starting_balance(1, 8, True)
