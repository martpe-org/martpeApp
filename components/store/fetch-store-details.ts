import { FetchStoreDetailsResponseType } from "./fetch-store-details-type";

export const fetchStoreDetails = async (slug: string) => {
  try {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/stores/${slug}`;
    console.log('Fetching store details from:', url);

    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) {
      console.log('Fetch failed with status:', res.status, await res.text());
      throw new Error();
    }

    return (await res.json()) as FetchStoreDetailsResponseType;
  } catch (error) {
    console.log('Fetch store details error ', error);
    return null;
  }
};
