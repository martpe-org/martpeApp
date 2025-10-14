import { FetchStoreItemsResponseType } from './fetch-store-items-type';

export const fetchStoreItems = async (slug: string) => {
  try {

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
