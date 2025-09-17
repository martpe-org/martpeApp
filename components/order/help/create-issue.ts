import { getAsyncStorageItem } from "@/utility/asyncStorage";

export type CreateIssueBodyT = {
  orderId: string;
  descriptor: {
    code: string;
    short_desc: string;
    long_desc: string;
    additional_desc?: {
      url: string;
      content_type: string;
    };
    images?: {
      url: string;
      size_type: string;
    }[];
    media?: {
      url: string;
    }[];
  };
  items?: {
    catalog_id: string;
    qty: number;
  }[];
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
};

export const createIssueAction = async (input: CreateIssueBodyT) => {
  try {
    // ✅ Get token from AsyncStorage instead of cookies
    const authToken = await getAsyncStorageItem("auth-token");

    if (!authToken) {
      throw new Error("No auth token found");
    }

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/issues/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(input),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed with status ${res.status}`);
    }

    const data = (await res.json()) as {
      _id: string;
      // status: string;
      // created_at: string;
    };

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Failed to create issue",
        details:
          error instanceof Error ? error.message : "Create ticket failed",
      },
    };
  }
};
