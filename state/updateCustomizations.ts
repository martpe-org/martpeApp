import Constants from 'expo-constants';
import { getAsyncStorageItem } from '../.../../utility/asyncStorage';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export async function updateCartItemCustomizationsAction(
  cartItemId: string,
  qty: number,
  product_slug: string,
  product_price: any,
  selected_customizations: SelectedCustomizationType[]
) {
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
        product_slug,
        product_price,
        selected_customizations,
        update_target: 'customization'
      }),
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      console.log('update cart item customizations notok:', response.status, data);
      throw new Error('Failed to update cart item customizations');
    }

    return { success: true };
  } catch (e) {
    console.log('update cart item customizations action error:', e);
    return { success: false };
  }
}