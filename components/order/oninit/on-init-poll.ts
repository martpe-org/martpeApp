'use server';

import { cookies } from 'next/headers';
import { OnInitCartResponseType } from './oninit-cart-type';

export async function onInitCartAction(messageId: string) {
  console.log('on_init poll input', messageId);
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/payment/oninit?messageId=${messageId}`,
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
        console.log('In 404');
        return { status: 404, error: { message: 'poll' } };
      }
      const data = await response.json();
      console.log('on_init notok:', response.status, data);
      throw new Error();
    }

    const data = (await response.json()) as OnInitCartResponseType;
    return { status: 200, data };
  } catch (e: any) {
    console.log('oninit cart action error:', e);
    return {
      status: 500,
      error: { message: e.message ?? 'oninit poll failed' }
    };
  }
}
