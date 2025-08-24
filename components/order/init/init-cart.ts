'use server';

import { cookies } from 'next/headers';
import { InitCartResponseType } from './init-cart-type';

export interface InitCartInputType {
  onselect_msgId: string;
  selected_fulfillmentId: string;
}

export async function initCartAction(
  messageId: string,
  selectedFulfillmentId: string
) {
  console.log('init input', messageId, selectedFulfillmentId);
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/payment/init`,
      {
        method: 'POST',
        body: JSON.stringify({
          onselect_msgId: messageId,
          selected_fulfillmentId: selectedFulfillmentId
        }),
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (!response.ok) {
      const data = await response.json();
      console.log('init notok:', response.status, data);
      throw new Error(data?.error?.message || '');
    }
    const data = (await response.json()) as InitCartResponseType;
    return { success: true, data };
  } catch (e: any) {
    console.log('init cart action error:', e);
    return {
      success: false,
      error: { message: e?.message ?? 'init failed' }
    };
  }
}
