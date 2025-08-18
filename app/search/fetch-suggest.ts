import { ApiErrorResponseType } from '../../common-types';
import { FetchSuggestionsType } from './fetch-suggest-type';
// import Constants from "expo-constants";

// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchSearchSuggesstions = async (
  signal: any,
  lat: number,
  lon: number,
  pincode: string,
  query: string,
  domain?: string
) => {
  console.log(`lat=${lat}lon=${lon}pincode=${pincode}domain=${domain}`);
  try {
    const res = await fetch(
      `${
       process.env.EXPO_PUBLIC_API_URL
      }/search/suggest?query=${query}&lat=${lat}&lon=${lon}&pincode=${pincode}${
        domain ? `&domain=${domain?.replace('ONDC:', '')}` : ''
      }`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal
      }
    );

    if (!res.ok) {
      console.log('fetch suggestions failed');
      throw new Error();
    }

    return (await res.json()) as FetchSuggestionsType;
  } catch (error) {
    console.log('Fetch suggestions error ', error);
    return null;
  }
};
