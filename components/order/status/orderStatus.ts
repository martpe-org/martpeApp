'use server';

import { statusOrder } from '@/lib/api/orders-status/fetch-order-status';
import { cookies } from 'next/headers';

export async function orderStatusAction(orderId: string) {
  const cookieStore = await cookies();
  const at = cookieStore.get('auth-token')?.value;

  const result:
    | { success: false; error?: string }
    | { success: true; data?: string } = await statusOrder(orderId, at!);
  return result;
}
