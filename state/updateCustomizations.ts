'use server';

import { SelectedCustomizationType } from '@/lib/api/user/fetch-user-type';
import { cookies } from 'next/headers';

export async function updateCartItemCustomizationsAction(
  cartItemId: string,
  qty: number,
  product_slug: string,
  product_price: any,
  selected_customizations: SelectedCustomizationType[]
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/carts/update-item`,
      {
        method: 'PUT',
        body: JSON.stringify({
          cartItemId,
          qty,
          product_slug,
          product_price,
          selected_customizations,
          update_target: 'customization'
        }),
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (!response.ok) {
      throw new Error();
    }
    return { success: true };
  } catch (e) {
    console.log('delete addr action error:', e);
    return { success: false };
  }
}
