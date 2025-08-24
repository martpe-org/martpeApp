'use server';

import { reOrder } from '@/lib/api/reorder/reorder';
import { cookies } from 'next/headers';

export async function reorderAction(orderId: string, storeId: string) {
  const cookieStore = await cookies();
  const at = cookieStore.get('auth-token')?.value;

  const result = await reOrder(orderId, storeId, at!);
  return result;
}
