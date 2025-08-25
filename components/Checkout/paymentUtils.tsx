import axios from "axios";
import RazorpayCheckout from "react-native-razorpay";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { router } from "expo-router";
import { userDetailsT } from "./types";

const RAZORPAY_KEY_ID = "rzp_test_28OLg2dI6uOgm3";
const CREATE_ORDER_URL = `https://api-sandbox.martpe.in/api/v1/user/payment/create_order`;
const CONFIRM_WS_URL = "wss://api-sandbox.martpe.in/api/v1/user/confirm";

export interface PaymentOptions {
  cartId: string;
  initId: string;
  deliveryAddressId: string;
  grandTotal: number;
  userDetails: userDetailsT;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Creates a payment order and initiates Razorpay payment flow
 */
export const createPaymentOrder = async (
  options: PaymentOptions
): Promise<PaymentResult> => {
  const { cartId, initId, deliveryAddressId, grandTotal, userDetails } = options;

  try {
    if (!userDetails.accessToken) {
      return { success: false, error: "No access token" };
    }

    // Create order via API
    const response = await axios.post(
      CREATE_ORDER_URL,
      {
        cartId,
        oninitId: initId,
        deliveryAddressId,
      },
      {
        headers: {
          Authorization: `Bearer ${userDetails.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!response?.data?.id) {
      return { success: false, error: "Failed to create order" };
    }

    // Configure Razorpay options
    const razorpayOptions = {
      description: `Payment for order ${response.data.id}`,
      image: "https://i.imgur.com/n5tjHFD.png",
      currency: "INR",
      key: RAZORPAY_KEY_ID,
      amount: Math.round(grandTotal * 100), // Convert to paisa
      name: "Checkout Order",
      order_id: response.data.id,
      prefill: {
        email: userDetails.email || "",
        contact: userDetails.phoneNumber || "",
        name: `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim(),
      },
      theme: { color: "#00BC66" },
    };

    // Open Razorpay payment
    try {
      const paymentResult = await RazorpayCheckout.open(razorpayOptions);
      return {
        success: true,
        orderId: response.data.id,
      };
    } catch (paymentError) {
      console.error("Razorpay payment failed:", paymentError);
      return { success: false, error: "Payment failed" };
    }
  } catch (error) {
    console.error("Create payment order error:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return { success: false, error: "Request timeout" };
      }
      if (error.response?.status === 401) {
        return { success: false, error: "Authentication failed" };
      }
    }
    
    return { success: false, error: "Failed to create payment order" };
  }
};

/**
 * Confirms the order after successful payment
 */
export const confirmOrder = (
  initId: string,
  userId: string,
  onSuccess: (orderId: string) => void,
  onError: (error: string) => void
): WebSocket => {
  const ws = new WebSocket(CONFIRM_WS_URL);
  let isConnected = false;

  // Set connection timeout
  const connectionTimeout = setTimeout(() => {
    if (!isConnected) {
      ws.close();
      onError("Connection timeout");
    }
  }, 30000); // 30 seconds

  ws.onopen = () => {
    isConnected = true;
    clearTimeout(connectionTimeout);
    
    const confirmCallBody = {
      context: { oninitId: initId },
      message: { userId },
    };
    
    ws.send(JSON.stringify(confirmCallBody));
  };

  ws.onmessage = (event) => {
    try {
      const response = JSON.parse(event.data);
      
      if (response?.data?.orderId) {
        onSuccess(response.data.orderId);
        ws.close();
      } else if (response.error) {
        onError(response.error.message || "Order confirmation failed");
        ws.close();
      }
    } catch (error) {
      console.error("Error parsing confirm response:", error);
      onError("Invalid response from server");
      ws.close();
    }
  };

  ws.onerror = (error) => {
    console.error("Confirm WebSocket error:", error);
    clearTimeout(connectionTimeout);
    onError("Connection error");
  };

  ws.onclose = (event) => {
    clearTimeout(connectionTimeout);
    if (!event.wasClean && isConnected) {
      onError("Connection closed unexpectedly");
    }
  };

  return ws;
};

/**
 * Shows payment success dialog
 */
export const showPaymentSuccessDialog = (paymentId: string) => {
  Dialog.show({
    closeOnOverlayTap: false,
    type: ALERT_TYPE.SUCCESS,
    title: "Payment successful!",
    textBody: `Your payment ID is ${paymentId}.`,
    autoClose: 3000,
  });
};

/**
 * Shows payment error dialog
 */
export const showPaymentErrorDialog = (error: string = "Payment failed") => {
  Dialog.show({
    closeOnOverlayTap: false,
    type: ALERT_TYPE.DANGER,
    title: "Payment Failed",
    button: "Try Again",
    textBody: error,
    onPressButton: () => {
      Dialog.hide();
    },
  });
};

/**
 * Shows order success dialog
 */
export const showOrderSuccessDialog = (orderId: string) => {
  Dialog.show({
    closeOnOverlayTap: false,
    type: ALERT_TYPE.SUCCESS,
    title: "Order placed successfully!",
    textBody: "We're excited to get it to you. Click here to view and track your order.",
    button: "View Order",
    onPressButton: () => {
      router.push({
        pathname: "./(tabs)/orders/[order]",
        params: { id: orderId },
      });
    },
  });
};

/**
 * Shows order error dialog
 */
export const showOrderErrorDialog = (error: string = "Order confirmation pending") => {
  Dialog.show({
    closeOnOverlayTap: false,
    type: ALERT_TYPE.DANGER,
    title: "Order Confirmation Issue",
    textBody: error,
    button: "OK",
    onPressButton: () => {
      router.back();
    },
  });
};