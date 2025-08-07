import Constants from 'expo-constants';
import { getAsyncStorageItem } from '../.../../utility/asyncStorage';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export async function updateCartItemQtyAction(cartItemId: string, qty: number) {
  try {
    const authToken = await getAsyncStorageItem('auth-token');
    if (!authToken) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${BASE_URL}/carts/update-item`, {
      method: 'PUT',
      body: JSON.stringify({
        cartItemId,
        qty,
        update_target: 'qty',
      }),
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.log('update qty not ok:', response.status, data);
      throw new Error('Failed to update cart item quantity');
    }

    return { success: true };
  } catch (e) {
    console.log('updateCartItemQtyAction error:', e);
    return { success: false };
  }
}
