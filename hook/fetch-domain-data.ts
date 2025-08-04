import { FetchDomainType } from './fetch-domain-type';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchHomeByDomain = async (
  lat: number,
  lon: number,
  pincode: string,
  domain: string,
  page?: number,
  limit?: number
) => {
  console.log(
    `lat=${lat}lon=${lon}pincode=${pincode}page=${page}limit=${limit}`
  );
  try {
    const res = await fetch(
      `${BASE_URL}/home/domain/${domain.replace(
        'ONDC:',
        ''
      )}?lat=${lat}&lon=${lon}&pincode=${pincode}${
        page ? `&page=${page}` : ''
      }${limit ? `&size=${limit}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      console.log('fetch home by domain failed');
      throw new Error();
    }

    return (await res.json()) as FetchDomainType;
  } catch (error) {
    console.log('Fetch homeby domain error ', error);
    return null;
  }
};
