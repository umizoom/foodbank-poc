import { useState, useCallback } from 'react';
import { api } from '@/shared/api/client';
import { PageHeader } from '@/shared/components/PageHeader';
import { CardSimulator } from './CardSimulator';
import { ClientBanner } from './ClientBanner';
import { ItemBrowser } from './ItemBrowser';
import { CartPanel } from './CartPanel';
import { CheckoutResult } from './CheckoutResult';
import type { Client, Cart, Transaction } from '@/shared/api/types';

type Phase = 'identify' | 'cart' | 'result';

export function CheckoutPage() {
  const [phase, setPhase] = useState<Phase>('identify');
  const [client, setClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const handleClientIdentified = useCallback((c: Client, newCart: Cart) => {
    setClient(c);
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
    setClient(null);
    setCart(null);
    setPhase('identify');
  }, [cart]);

  const handleNewCheckout = useCallback(() => {
    setClient(null);
    setCart(null);
    setTransaction(null);
    setPhase('identify');
  }, []);

  return (
    <div>
      <PageHeader title="Checkout" />

      {phase === 'identify' && <CardSimulator onClientIdentified={handleClientIdentified} />}

      {phase === 'cart' && client && cart && (
        <>
          <ClientBanner client={client} cart={cart} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <ItemBrowser cart={cart} onCartUpdate={refreshCart} />
            <CartPanel
              cart={cart}
              clientBalance={client.balance}
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
