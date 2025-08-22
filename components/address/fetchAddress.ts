import { AddressType } from '../../common-types';

export const fetchAddress = async (authToken: string): Promise<AddressType[] | null> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/users/address`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      }
    );

    if (!response.ok) {
      console.log('fetch address failed');
      throw new Error();
    }

    return await response.json();
  } catch (error) {
    console.log('Fetch address error', error);
    return null;
  }
};