export interface InitCartPayload {
  onselect_msgId: string;
  storeId: string;
  selected_fulfillmentId: string;
  addressId: string;
  address: {
    name: string;
    phone: string;
    building?: string;
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    gps: { lat: number; lon: number };
  };
  offerId?: string;
  referrer_id?: string;
}

export interface InitCartResponse {
  error?: {
    message: string;
  };
  data?: {
    id: string;
    amount: number;
    amount_due: number;
    amount_paid: number;
    attempts: number;
    created_at: number;
    currency: string;
    entity: string;
    notes: {
      oninitId: string;
      orderId: string;
      orderno: string;
      storeId: string;
      userId: string;
    };
    offer_id: any;
    receipt: string;
    status: string;
  };
}

export const initCart = async (
  authToken: string,
  payload: InitCartPayload
): Promise<{ status: number; data: InitCartResponse }> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result: InitCartResponse;
    
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid response from server`);
    }

    if (!response.ok || result.error) {
      throw new Error(result.error?.message || `Server error: ${response.status}`);
    }

    return { status: response.status, data: result };
  } catch (error: any) {
    console.error("Init cart error:", error);
    return {
      status: 500,
      data: { error: { message: error.message || "Init cart failed" } },
    };
  }
};
