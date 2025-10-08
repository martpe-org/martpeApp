import { FetchTicketDetailType } from "./fetch-ticket-detail-type";

export const fetchTicketDetail = async (
  authToken: string,
  ticketId: string,
) => {
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const response = await fetch(
      `${API_URL}/tickets?action=detail&ticketId=${ticketId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.log("❌ Fetch ticket detail failed with status:", response.status);
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to fetch ticket detail");
    }

    const data = (await response.json()) as FetchTicketDetailType;
    return data;
  } catch (error) {
    console.log("⚠️ Fetch ticket detail error:", error);
    return null;
  }
};
