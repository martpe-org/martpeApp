import Constants from 'expo-constants';
import { getAsyncStorageItem } from '../.../../utility/asyncStorage';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export async function removeCartAction(storeId: string) {
  try {
    const authToken = await getAsyncStorageItem('auth-token');
    if (!authToken) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${BASE_URL}/carts/remove/${storeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.log('remove cart notok:', response.status, data);
      throw new Error('Failed to remove cart');
    }

    return { success: true };
  } catch (e) {
    console.log('delete cart action error:', e);
    return { success: false };
  }
}
