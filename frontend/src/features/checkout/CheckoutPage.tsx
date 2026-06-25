import { useState, useCallback } from 'react';
import { api } from '@/shared/api/client';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { CardSimulator } from './CardSimulator';
import { OnetimeCheckoutForm } from './OnetimeCheckoutForm';
import { NeighbourBanner } from './NeighbourBanner';
import { ItemBrowser } from './ItemBrowser';
import { CartPanel } from './CartPanel';
import { CheckoutResult } from './CheckoutResult';
import type { Neighbour, Cart, Transaction } from '@/shared/api/types';

type Phase = 'identify' | 'onetime' | 'cart' | 'result';

export function CheckoutPage() {
  const [phase, setPhase] = useState<Phase>('identify');
  const [neighbour, setNeighbour] = useState<Neighbour | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const handleNeighbourIdentified = useCallback((n: Neighbour, newCart: Cart) => {
    setNeighbour(n);
    setCart(newCart);
    setPhase('cart');
  }, []);

  const refreshCart = useCallback(async () => {
    if (!cart) return;
    const updated = await api.get<Cart>(`/api/carts/${cart.id}/`);
    setCart(updated);
  }, [cart]);

  const handleCheckoutSuccess = useCallback((tx: Transaction) => {
    setTransaction(tx);
    setPhase('result');
  }, []);

  const handleCancel = useCallback(async () => {
    if (cart) {
      await api.delete(`/api/carts/${cart.id}/`);
    }
    setNeighbour(null);
    setCart(null);
    setPhase('identify');
  }, [cart]);

  const handleNewCheckout = useCallback(() => {
    setNeighbour(null);
    setCart(null);
    setTransaction(null);
    setPhase('identify');
  }, []);

  return (
    <div>
      <PageHeader title="Checkout" />

      {phase === 'identify' && (
        <>
          <CardSimulator onNeighbourIdentified={handleNeighbourIdentified} />
          <div className="max-w-md mx-auto mt-4 text-center">
            <p className="text-sm text-gray-400 mb-3">— or —</p>
            <Button variant="secondary" onClick={() => setPhase('onetime')}>
              One-Time Courtesy Checkout
            </Button>
          </div>
        </>
      )}

      {phase === 'onetime' && (
        <OnetimeCheckoutForm
          onNeighbourIdentified={handleNeighbourIdentified}
          onCancel={() => setPhase('identify')}
        />
      )}

      {phase === 'cart' && neighbour && cart && (
        <>
          <NeighbourBanner neighbour={neighbour} cart={cart} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <ItemBrowser cart={cart} onCartUpdate={refreshCart} />
            <CartPanel
              cart={cart}
              neighbourBalance={neighbour.balance}
              onCartUpdate={refreshCart}
              onCheckoutSuccess={handleCheckoutSuccess}
              onCancel={handleCancel}
            />
          </div>
        </>
      )}

      {phase === 'result' && (
        <CheckoutResult transaction={transaction} onNewCheckout={handleNewCheckout} />
      )}
    </div>
  );
}
