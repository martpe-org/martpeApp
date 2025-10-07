import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const userDetailsRaw = await AsyncStorage.getItem("userDetails");

    if (!userDetailsRaw) {
      throw new Error("User details not found");
    }

    const userDetails = JSON.parse(userDetailsRaw);
    const authToken = userDetails?.accessToken;

    if (!authToken) {
      throw new Error("Authentication token not found in user details");
    }

    const url = `${process.env.EXPO_PUBLIC_API_URL}/issues/create`;
    console.log("➡️ Calling:", url);
    console.log("🧾 Payload:", JSON.stringify(input, null, 2));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(input),
    });

    const text = await res.text();
    console.log("🧠 Raw server response:", text);

    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${text}`);
    }

    const data = JSON.parse(text);
    return { success: true, data };
  } catch (error) {
    console.error("❌ createIssueAction error:", error);
    return {
      success: false,
      error: {
        message: "Failed to create issue",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};


