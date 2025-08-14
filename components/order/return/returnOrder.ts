'use server';

import {
  OrderReturnProps,
  returnOrder
} from '@/lib/api/order-return/return-order';
import { cookies } from 'next/headers';

export async function returnOrderAction(payload: OrderReturnProps) {
  const cookieStore = await cookies();
  const at = cookieStore.get('auth-token')?.value;

  const result:
    | { success: false; error?: string }
    | { success: true; data?: string } = await returnOrder(payload, at!);

  return result;
}
