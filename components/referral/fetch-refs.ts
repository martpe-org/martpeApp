import { FetchReferralsResponseType } from "./fetch-refs-type";

export const fetchReferrals = async (
  authToken: string
): Promise<FetchReferralsResponseType | null> => {
  try {
    if (!process.env.EXPO_PUBLIC_API_URL) {
      throw new Error("BASE_URL is not defined");
    }

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/v1/users/referral`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.log("fetch referrals failed", await res.json());
      throw new Error("Failed to fetch referrals");
    }

    return (await res.json()) as FetchReferralsResponseType;
  } catch (error) {
    console.log("Fetch referrals error", error);
    return null;
  }
};
