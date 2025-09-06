import RazorpayCheckout from "expo-razorpay";
import { Alert } from "react-native";
import { router } from "expo-router";

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_28OLg2dI6uOgm3";

export interface PaymentOptions {
  rpOrderId: string;
  orderId: string;
  amount: number;
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
  error?: string;
}

/**
 * Processes Razorpay payment
 */
export const processRazorpayPayment = async (
  options: PaymentOptions
): Promise<PaymentResult> => {
  const { rpOrderId, orderId, amount, storeName, userDetails } = options;

  try {
    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // Convert to paisa
      currency: "INR",
      name: "Martpe",
      description: `Payment for ${storeName} - Order #${orderId}`,
      order_id: rpOrderId,
      prefill: {
        name: `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim(),
        email: userDetails.email || "",
        contact: userDetails.phoneNumber || "",
      },
      theme: { color: "#00BC66" },
    };

    const paymentResult = await RazorpayCheckout.open(razorpayOptions);
    
    return {
      success: true,
      orderId: orderId,
    };
  } catch (error: any) {
    console.error("Razorpay payment failed:", error);
    return { 
      success: false, 
      error: error.description || "Payment failed" 
    };
  }
};

/**
 * Shows payment success alert
 */
export const showPaymentSuccessAlert = (orderId: string) => {
  Alert.alert(
    "Payment Successful!",
    `Order #${orderId} has been placed successfully.`,
    [
      {
        text: "View Order",
        onPress: () => router.push(`/orders/${orderId}`),
      },
    ]
  );
};

/**
 * Shows payment error alert
 */
export const showPaymentErrorAlert = (error: string = "Payment failed", storeId?: string) => {
  Alert.alert(
    "Payment Failed",
    `${error} If money was deducted, it will be refunded within 3-5 business days.`,
    [
      {
        text: "OK",
        onPress: () => {
          if (storeId) {
            router.push(`/cart?storeid=${storeId}`);
          }
        },
      },
    ]
  );
};

/**
 * Gets user-friendly error message from error code or message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.description) return error.description;
  return "Something went wrong. Please try again.";
};