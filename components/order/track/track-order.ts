'use server';

import { trackCall } from '@/lib/api/order-track/track';
import { cookies } from 'next/headers';

export async function trackAction(orderId: string) {
  const cookieStore = await cookies();
  const at = cookieStore.get('auth-token')?.value;

  const result:
    | { success: true; message_id: string }
    | { success: false; error: string } = await trackCall(orderId, at!);

  return result;
}
