import { FetchOrderDetailType } from "../order/fetch-order-detail-type";
import { FetchStoreDetailsResponseType } from "../store/fetch-store-details-type";

export type FetchReferralsResponseType = FetchReferralType[];

export interface FetchReferralType {
  _id: string;
  store: FetchStoreDetailsResponseType;
  referrals: [
    {
      storeId: string;
      amount: number;
      userId: string;
      orderId: string;
      status: string;
      order: FetchOrderDetailType & { settlement_status: string };
    },
  ];
}
