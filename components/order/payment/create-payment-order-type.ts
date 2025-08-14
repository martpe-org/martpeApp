export interface CreatePaymentResponseType {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: string;
  id: string;
  notes: Notes;
  offer_id: any;
  receipt: string;
  status: string;
}

export interface Notes {
  oninitId: string;
  orderId: string;
  orderno: string;
  storeId: string;
  userId: string;
}
