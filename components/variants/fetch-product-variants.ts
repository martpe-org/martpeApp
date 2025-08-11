import { ProductVariant } from "./fetch-product-variants-type";
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchProductVariants = async (
  slug: string,
  store_id: string,
  parentItemId: string
) => {
  try {
    console.log(
      "-------------->",
      `${BASE_URL}/products/variants?slug=${slug}&parentItemId=${parentItemId}&storeId=${store_id}`
    );
    const res = await fetch(
      `${BASE_URL}/products/variants?slug=${slug}&parentItemId=${parentItemId}&storeId=${store_id}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      console.log("fetch product variants failed");
      throw new Error();
    }

    return (await res.json()) as ProductVariant[];
  } catch (error) {
    console.log("Fetch product variants error ", error);
    return null;
  }
};
