"use server";

import { cookies } from "next/headers";
import { SelectCartResponseType } from "./select-cart-type";

export interface SelectCartInputType {
  lat: number;
  lon: number;
  pincode: string;
  context: {
    domain: string;
    bpp_uri: string;
    bpp_id: string;
    core_version: string;
  };
  provider_id: string;
  location_id: string;
  storeId: string;
  deliveryAddressId: string;
  offerId?: string;
}

export async function selectCartAction(input: SelectCartInputType) {
  console.log("select input", input);
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/checkout/select`,
      {
        method: "POST",
        body: JSON.stringify(input),
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const data = await response.json();
      console.log("select notok:", response.status, data);
      throw new Error(data?.error?.message || "Merchant unavailable");
    }
    const data = (await response.json()) as SelectCartResponseType;
    return { success: true, data };
  } catch (e: any) {
    console.log("select cart action error:", e);
    return {
      success: false,
      error: { message: e?.message ?? "cart checkout failed" },
    };
  }
}
