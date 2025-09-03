import { cache } from 'react';
import { FetchStoreDetailsResponseType } from './fetch-store-details-type';

export const fetchStoreDetails = cache(async (slug: string) => {
  try {
    console.log(
      '-------------->',
      `${process.env.EXPO_PUBLIC_API_URL}/stores/${slug}`
    );
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/stores/${slug}`, {
      method: 'GET'
    });

    if (!res.ok) {
      console.log('fetch store details failed');
      throw new Error();
    }

    return (await res.json()) as FetchStoreDetailsResponseType;
  } catch (error) {
    console.log('Fetch store details error ', error);
    return null;
  }
});
