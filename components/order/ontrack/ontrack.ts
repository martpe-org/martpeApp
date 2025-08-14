'use server';

import { onTrackCall } from '@/lib/api/order-track/onTrackCall';
import { cookies } from 'next/headers';

export async function onTrackAction(message_id: string) {
  const cookieStore = await cookies();
  const at = cookieStore.get('auth-token')?.value;

  const result = await onTrackCall(message_id, at!);
  return result;
}
