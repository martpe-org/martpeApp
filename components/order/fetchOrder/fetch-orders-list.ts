import { ApiErrorResponseType } from "../common-types";
import { FetchOrdersListResponseType } from "./fetch-orders-list-type";

export const fetchOrderList = async (
  authToken: string,
  page?: string | null,
  size?: string | null
) => {
  try {
    const res = await fetch(
      `${process.env.BACKEND_BASE_URL}/orders?action=list${
        page ? `&page=${page}` : ""
      }${size ? `&size=${size}` : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.log("fetch orders failed");
      throw new Error();
    }

    return (await res.json()) as FetchOrdersListResponseType;
  } catch (error) {
    console.log("Fetch orders error ", error);
    return null;
  }
};
