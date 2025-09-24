import { getAsyncStorageItem } from "../../utility/asyncStorage";
import { SelectedCustomizationType } from "../user/fetch-user-type";

export async function updateCartItemCustomizationsAction(
  cartItemId: string,
  qty: number,
  product_slug: string,
  product_price: any,
  selected_customizations: SelectedCustomizationType[]
) {
  try {
    // ✅ get auth token from AsyncStorage
    const authToken = await getAsyncStorageItem("auth-token");

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/carts/update-item`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId,
          qty,
          product_slug,
          product_price,
          selected_customizations,
          update_target: "customization", // required by backend
        }),
      }
    );

    if (!response.ok) {
      console.error("updateCartItemCustomizationsAction failed:", response.status);
      return { success: false };
    }

    return { success: true };
  } catch (e) {
    console.error("updateCartItemCustomizationsAction error:", e);
    return { success: false };
  }
}
