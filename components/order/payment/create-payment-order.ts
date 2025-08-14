'use server';

import { cookies } from 'next/headers';
import { CreatePaymentResponseType } from './create-payment-order-type';

export interface CreatePaymentInputType {
  oninitMsgId: string;
  offer_id?: string;
  method?: 'netbanking' | 'upi' | 'card';
  bank_account?: {
    name: string;
    account_number: string;
    ifsc: string;
  };
}

export async function createPaymentAction(input: CreatePaymentInputType) {
  console.log('create payment input', input);
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/payment/create-payment`,
      {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (!response.ok) {
      const data = await response.json();
      console.log('create payment notok:', response.status, data);
      throw new Error();
    }

    return (await response.json()) as CreatePaymentResponseType;
  } catch (e: any) {
    console.log('create payment action error:', e);
    return null;
  }
}
