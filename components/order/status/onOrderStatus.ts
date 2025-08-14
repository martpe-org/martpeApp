'use server';

import { cookies } from 'next/headers';
import {
  OnStatusOrder,
  OnStatusT
} from '@/lib/api/orders-status/fetch-onstatus';

export async function OnOrderStatusAction(orderId: string) {
  const cookieStore = await cookies();
  const at = cookieStore.get('auth-token')?.value;

  const result:
    | { success: false; error?: string }
    | { success: true; data?: OnStatusT } = await OnStatusOrder(orderId, at!);
  return result;
}
