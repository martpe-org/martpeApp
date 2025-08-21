import { FetchStoreItemsResponseType } from './fetch-store-items-type';
// import Constants from 'expo-constants';
// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchStoreItems = async (slug: string) => {
  try {
    console.log(
      '-------------->',
      `${process.env.EXPO_PUBLIC_API_URL}/stores/${slug}/products?size=100`
    );
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/stores/${slug}/products?size=100`,
      {
        method: 'GET'
      }
    );

    if (!res.ok) {
      console.log('fetch store items failed');
      throw new Error();
    }

    return (await res.json()) as FetchStoreItemsResponseType;
  } catch (error) {
    console.log('Fetch store items error ', error);
    return null;
  }
};
