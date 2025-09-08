import { getAsyncStorageItem } from "@/utility/asyncStorage";
import { CreatePaymentResponseType } from "./create-payment-order-type";

export interface CreatePaymentInputType {
  oninitMsgId: string;
  offer_id?: string;
  method?: "netbanking" | "upi" | "card";
  bank_account?: {
    name: string;
    account_number: string;
    ifsc: string;
  };
}

export const createPaymentOrder = async (
  input: CreatePaymentInputType
): Promise<{ status: number; data: any }> => {
  try {
    const authToken = await getAsyncStorageItem("auth-token");

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/payment/create-payment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.log("Payment creation failed:", data);
      return { status: res.status, data };
    }

    return { status: 200, data: data as CreatePaymentResponseType };
  } catch (error) {
    console.log("Fetch error:", error);
    return {
      status: 500,
      data: { error: { message: "create payment failed" } },
    };
  }
};

// Add this to resolve the default export warning
export default function CreatePaymentPage() {
  return null;
}
