import Constants from 'expo-constants';
import { getAsyncStorageItem } from '../.../../utility/asyncStorage';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export async function removeCartItemsAction(cartItemIds: string[]) {
  try {
    const authToken = await getAsyncStorageItem('auth-token');
    if (!authToken) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${BASE_URL}/carts/remove-items`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItemIds }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.log('remove cart items notok:', response.status, data);
      throw new Error('Failed to remove cart items');
    }

    return { success: true };
  } catch (e) {
    console.log('remove unavailable cart items action error:', e);
    return { success: false };
  }
}