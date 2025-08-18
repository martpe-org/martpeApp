// import Constants from "expo-constants";

// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

type addItemActionInputType = {
  store_id: string;
  slug: string;
  catalog_id: string;
  qty: number;
  customizable: boolean;
  customizations?: {
    groupId: string;
    optionId: string;
    name: string;
  }[];
};

export interface AddToCartResponseType {
  _id: string;
  product_slug: string;
  user_id: string;
  store_id: string;
  catalog_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
  unit_max_price: number;
  total_max_price: number;
  customizable: boolean;
  customization_hash?: string;
  selected_customizations?: SelectedCustomization[];
  dynamicId?: string;
}

export interface SelectedCustomization {
  groupId: string;
  name: string;
  optionId: string;
}

export async function addToCartAction(
  input: addItemActionInputType,
  authToken: string
) {
  try {
    if (!authToken) {
      console.error("No auth token provided");
      return { success: false };
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carts/add-item`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("addToCartAction error:", errorData);
      return { success: false };
    }

    const data = (await response.json()) as AddToCartResponseType;
    return { success: true, data };
  } catch (e) {
    console.error("addToCartAction exception:", e);
    return { success: false };
  }
}
