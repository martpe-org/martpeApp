'use server';

import { cancelOrder } from '@/lib/api/order-cancel/cancel-order';
import { cookies } from 'next/headers';

export async function cancelOrderAction(orderId: string, reasonCode: string) {
  const cookieStore = await cookies();
  const at = cookieStore.get('auth-token')?.value;

  const result:
    | { success: false; error?: string }
    | { success: true; data?: string } = await cancelOrder(
    orderId,
    reasonCode,
    at!
  );
  return result;
}
