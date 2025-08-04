import { ApiErrorResponseType } from '../common-types';
import { FetchHomeType } from './fetch-home-type';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchHome = async (lat: number, lon: number, pincode: string) => {
  console.log(`FETCHHOME: lat=${lat}lon=${lon}pincode=${pincode}`);
  try {
    const res = await fetch(
      `${BASE_URL}/home?lat=${lat}&lon=${lon}&pincode=${pincode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 60
        }
      }
    );

    if (!res.ok) {
      console.log('fetch home failed');
      throw new Error();
    }

    console.log('fetch home success');

    return (await res.json()) as FetchHomeType;
  } catch (error) {
    console.log('Fetch home error ', error);
    return null;
  }
};
