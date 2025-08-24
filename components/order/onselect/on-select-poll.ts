'use server';

import { cookies } from 'next/headers';
import { OnSelectCartResponseType } from './onselect-cart-type';

export async function onSelectCartAction(messageId: string) {
  console.log('on_select poll input', messageId);
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/checkout/onselect?messageId=${messageId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        return {
          status: 404,
          error: { message: 'Not found' }
        };
      }
      const data = await response.json();
      console.log('on_select notok:', response.status, data);
      throw new Error();
    }

    const data = (await response.json()) as OnSelectCartResponseType;
    return {
      status: 200,
      data
    };
  } catch (e: any) {
    console.log('onselect cart action error:', e);
    return {
      status: 500,
      error: { message: e?.message ?? 'onselect failed' }
    };
  }
}
