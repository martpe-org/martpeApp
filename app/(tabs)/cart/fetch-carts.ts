// import { ApiErrorResponseType } from "../common-types";
import { FetchCartType } from "./fetch-carts-type";
// import Constants from 'expo-constants';

// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchCarts = async (authToken: string) => {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const data = await res.json();
      console.log("fetch carts notok", res.status, data);
      console.log("fetch carts failed");
      throw new Error();
    }

    return (await res.json()) as FetchCartType[];
  } catch (error) {
    console.log("Fetch carts error ", error);
    return null;
  }
};
