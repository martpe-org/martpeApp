import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const deleteAddress = async (
  token: string,
  addressId: string,
  userId?: string
) => {
  try {
   const response = await fetch(
  `${BASE_URL}/users/address?addressId=${addressId}`,
  {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);


    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Delete error response:', errorBody);
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    return true;
  } catch (error) {
    console.error('Delete address error', error);
    return false;
  }
};
