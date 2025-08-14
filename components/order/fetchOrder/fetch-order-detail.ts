import { ApiErrorResponseType } from '../common-types';
import { FetchOrderDetailType } from './fetch-order-detail-type';

export const fetchOrderDetail = async (authToken: string, orderId: string) => {
  try {
    const res = await fetch(
      `${process.env.BACKEND_BASE_URL}/orders?action=detail&orderId=${orderId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      console.log('fetch orders failed');
      throw new Error();
    }

    return (await res.json()) as FetchOrderDetailType;
  } catch (error) {
    console.log('Fetch orders error ', error);
    return null;
  }
};
