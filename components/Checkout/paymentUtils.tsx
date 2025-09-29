import RazorpayCheckout from "expo-razorpay";
import { Alert } from "react-native";
import { router } from "expo-router";

const RAZORPAY_KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_iSUOdYDOHOoxbf";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export interface InitCartPayload {
  address: {
    name: string;
    phone: string;
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    gps?: { lat: number; lon: number };
    building?: string;
  };
  onselect_msgId: string;
  storeId: string;
  addressId: string;
  selected_fulfillmentId: string;
  offerId?: string;
  referrer_id?: string;
}

export interface PaymentData {
  id: string;
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: string;
  notes?: {
    orderId?: string;
    storeId?: string;
    userId?: string;
    addressId?: string;
    oninitId?: string;
    orderno?: string;
  };
  offer_id: string | null;
  receipt: string;
  status: string;
}

export interface PaymentOptions {
  payload: InitCartPayload;
  authToken: string;
  storeName: string;
  userDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

/**
 * Call backend to init cart + get Razorpay order
 */
const initializePayment = async (
  authToken: string,
  payload: InitCartPayload
): Promise<{ success: boolean; data?: PaymentData; error?: string }> => {
  try {
    if (!API_BASE_URL) throw new Error("API base URL not configured");

    const response = await fetch(`${API_BASE_URL}/init-cart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Cookie: `auth-token=${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Init-cart response:", result);

    if (!response.ok) {
      throw new Error(result?.error?.message || `HTTP ${response.status}`);
    }

    // ✅ FIX: Check for result.data.id instead of result.id
    if (!result?.data?.id) {
      throw new Error("Invalid payment response - missing order ID");
    }

    // ✅ FIX: Return the nested data object
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Payment initialization failed:", error);
    console.warn("InitCart error details:", error);
    return { success: false, error: error.message || "Failed to initialize payment" };
  }
};

const processRazorpayPayment = async (
  paymentData: PaymentData,
  storeName: string,
  userDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }
): Promise<PaymentResult> => {
  try {
    if (!RAZORPAY_KEY_ID) throw new Error("Razorpay key not configured");
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: result?.data?.amount,
      currency: result?.data?.currency,
      name: "Martpe",
      description: `Payment for ${result?.data?.notes?.storeName || "Order"} - Order #${result?.data?.notes?.orderId}`,
      order_id: result?.data?.id,
      prefill: {
        name: "harish",
        email: "test@example.com",
        contact: "7358301523",
      },
      theme: {
        color: "#00BC66",
      },
      retry: {
        enabled: true,
        max_count: 3,
      },
      modal: {
        ondismiss: () => {
          console.warn("Payment popup closed by user");
        },
      },
    };


    // Debugging log
    console.log("Opening Razorpay with options:", {
      ...options,
      key: "***hidden***", // hide key in logs
    });

    const result = await RazorpayCheckout.open(options);
    console.log("Payment successful:", result);

    return {
      success: true,
      orderId: paymentData.notes?.orderId || paymentData.id,
      paymentId: result.razorpay_payment_id,
    };
  } catch (error: any) {
    console.error("Razorpay payment failed:", error);

    // Handle cancelled payments specifically
    if (
      error?.error?.reason === "payment_cancelled" ||
      error?.description?.includes("cancelled")
    ) {
      return {
        success: false,
        error: "Payment was cancelled by you. Please try again.",
      };
    }

    // Default fallback for other Razorpay errors
    return {
      success: false,
      error: error?.error?.description || error?.message || "Payment failed",
    };
  }
};


/**
 * Main entry for checkout
 */
export const processPayment = async (
  options: PaymentOptions
): Promise<PaymentResult> => {
  try {
    console.log("Attempting payment initialization...");
    const initResult = await initializePayment(options.authToken, options.payload);

    if (!initResult.success || !initResult.data) {
      throw new Error(initResult.error || "Failed to initialize payment");
    }

    return await processRazorpayPayment(
      initResult.data,
      options.storeName,
      options.userDetails
    );
  } catch (error: any) {
    console.error("Complete payment flow failed:", error);
    console.warn("processPayment error details:", error);
    return { success: false, error: error.message || "Payment failed" };
  }
};

/**
 * Alerts
 */
export const showPaymentSuccessAlert = (orderId: string) => {
  Alert.alert(
    "Payment Successful! 🎉",
    `Your order #${orderId} has been placed successfully.`,
    [
      { text: "View Order", onPress: () => router.push(`/orders/${orderId}`) },
      { text: "Continue Shopping", style: "cancel", onPress: () => router.push("/(tabs)/home/HomeScreen") },
    ]
  );
};

export const showPaymentErrorAlert = (
  error: string = "Payment failed",
  storeId?: string,
  onRetry?: () => void
) => {
  const buttons: any[] = [
    {
      text: "OK",
      style: "cancel",
      onPress: () => {
      },
    },
  ];
  if (onRetry) {
    buttons.unshift({ text: "Retry", style: "default", onPress: onRetry });
  }

  Alert.alert(
    "Payment Failed",
    `${error}\n\nIf money was deducted from your account, it will be refunded within 3-5 business days.`,
    buttons
  );
};

/**
 * Minimal validation
 */
export const validatePaymentPayload = (
  payload: InitCartPayload
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!payload.storeId) errors.push("Store ID is required");
  if (!payload.selected_fulfillmentId) errors.push("Delivery option is required");
  if (!payload.addressId) errors.push("Address ID is required");
  if (!payload.onselect_msgId) errors.push("Message ID is required");
  if (!payload.address?.name) errors.push("Delivery name is required");
  if (!payload.address?.phone) errors.push("Phone number is required");
  return { valid: errors.length === 0, errors };
};
