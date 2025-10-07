import { FetchTicketsListItemType } from "./fetch-ticket-list-type";

export const fetchTicketsList = async (authToken: string) => {
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const response = await fetch(`${API_URL}/tickets?action=list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("❌ Fetch tickets failed with status:", response.status);
    }

    const data = (await response.json()) as FetchTicketsListItemType[];
    return data;
  } catch (error) {
    console.error("⚠️ Fetch tickets error:", error);
    return null;
  }
};
