import { cache } from 'react';
 import { FetchProductDetail } from './fetch-product-type';
// import Constants from 'expo-constants';

// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchProductDetails = cache(async (slug: string) => {
  try {
    console.log(
      '-------------->',
      `${process.env.EXPO_PUBLIC_API_URL}/products/${slug}`
    );
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/products/${slug}`,
      {
        method: 'GET'
      }
    );

    if (!res.ok) {
      console.log('fetch product details failed');
      throw new Error();
    }

    return (await res.json()) as FetchProductDetail;
  } catch (error) {
    console.log('Fetch product details error ', error);
    return null;
  }
});
