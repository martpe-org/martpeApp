"use server";

import { cookies } from "next/headers";

export async function removeCartItemsAction(cartItemIds: string[]) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/carts/remove-items`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItemIds }),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      console.log("remove cart items notok:", response.status, data);
      throw new Error();
    }
    return { success: true };
  } catch (e) {
    console.log("remove unavailable cart items action error:", e);
    return { success: false };
  }
}
