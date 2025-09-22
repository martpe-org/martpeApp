import { SearchStoresResponseType } from './search-stores-type';

export const searchStores = async (input: {
  lat: number;
  lon: number;
  pincode: string;
  query: string;
  domain?: string;
  page?: number;
  category?: string;
  size?: number;
  quicksearch?: string;
}) => {


  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/search/stores?query=${input.query}&lat=${
        input.lat
      }&lon=${input.lon}&pincode=${input.pincode}${
        input.domain ? `&domain=${input.domain?.replace('ONDC:', '')}` : ''
      }${input.page ? `&page=${input.page}` : ''}${
        input.category ? `&category=${input.category}` : ''
      }${input.size ? `&size=${input.size}` : ''}${
        input.quicksearch ? `&quicksearch=${input.quicksearch}` : ''
      }`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      throw new Error();
    }

    return (await res.json()) as SearchStoresResponseType;
  } catch (error) {
    return null;
  }
};
