import RazorpayCheckout from "expo-razorpay";
import { Alert } from "react-native";
import { router } from "expo-router";

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_28OLg2dI6uOgm3";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export interface InitCartPayload {
  address: {
    name: string;
    phone: string;
    building?: string;
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    gps?: { lat: number; lon: number };
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
  currency: string;
  notes: {
    orderId: string;
    storeId: string;
    userId: string;
  };
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
 * Initialize cart and get payment order from backend
 */
const initializePayment = async (
  authToken: string,
  payload: InitCartPayload
): Promise<{ success: boolean; data?: PaymentData; error?: string }> => {
  try {
    if (!API_BASE_URL) {
      throw new Error("API base URL not configured");
    }

    if (!authToken) {
      throw new Error("Authentication token required");
    }

    // Use the same endpoint structure as Next.js
    const response = await fetch(`${API_BASE_URL}/payment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
        "Cookie": `auth-token=${authToken}`, // Add cookie header for compatibility
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result: any;
    
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse response:", text);
      throw new Error("Invalid response from server");
    }

    console.log("Payment init response:", { status: response.status, result });

    if (!response.ok) {
      const errorMessage = result?.error?.message || result?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (result.error) {
      throw new Error(result.error.message || "Payment initialization failed");
    }

    // Handle the response structure - it might be nested in 'data' property
    const paymentData = result.data || result;
    
    if (!paymentData?.id) {
      console.error("Invalid payment response:", result);
      throw new Error("Invalid payment response - missing order ID");
    }

    return { success: true, data: paymentData };
  } catch (error: any) {
    console.error("Payment initialization failed:", error);
    return {
      success: false,
      error: error.message || "Failed to initialize payment"
    };
  }
};

/**
 * Process Razorpay payment
 */
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
    if (!RAZORPAY_KEY_ID) {
      throw new Error("Razorpay key not configured");
    }

    const userName = [userDetails.firstName, userDetails.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Customer';

    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: paymentData.amount, // Amount should already be in paisa from backend
      currency: paymentData.currency || "INR",
      name: "Martpe",
      description: `Payment for ${storeName} - Order #${paymentData.notes?.orderId || paymentData.id}`,
      order_id: paymentData.id,
      prefill: {
        name: userName,
        email: userDetails.email || "",
        contact: userDetails.phoneNumber || "",
      },
      theme: { 
        color: "#00BC66" 
      },
      modal: {
        ondismiss: () => {
          console.log("Payment modal dismissed");
        }
      },
      retry: {
        enabled: true,
        max_count: 3
      }
    };

    console.log("Opening Razorpay with options:", {
      ...razorpayOptions,
      key: "***hidden***"
    });

    const paymentResult = await RazorpayCheckout.open(razorpayOptions);

    console.log("Payment successful:", paymentResult);

    return {
      success: true,
      orderId: paymentData.notes?.orderId || paymentData.id,
      paymentId: paymentResult.razorpay_payment_id,
    };
  } catch (error: any) {
    console.error("Razorpay payment failed:", error);
    
    // Handle different types of errors
    let errorMessage = "Payment failed";
    
    if (error.code) {
      switch (error.code) {
        case 'BAD_REQUEST_ERROR':
          errorMessage = "Invalid payment request";
          break;
        case 'GATEWAY_ERROR':
          errorMessage = "Payment gateway error";
          break;
        case 'NETWORK_ERROR':
          errorMessage = "Network error. Please check your connection";
          break;
        case 'SERVER_ERROR':
          errorMessage = "Server error. Please try again";
          break;
        default:
          errorMessage = error.description || error.message || errorMessage;
      }
    } else if (error.description) {
      errorMessage = error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Alternative payment flow using create-payment endpoint
 */
const createPaymentOrder = async (
  authToken: string,
  oninitMsgId: string,
  offerId?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (!API_BASE_URL) {
      throw new Error("API base URL not configured");
    }

    const payload = {
      oninitMsgId,
      ...(offerId && { offer_id: offerId }),
      method: "upi" as const, // Default to UPI
    };

    const response = await fetch(`${API_BASE_URL}/payment/create-payment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Create payment failed:", result);
      throw new Error(result?.error?.message || `HTTP ${response.status}`);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Create payment order failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment order"
    };
  }
};

/**
 * Complete payment flow - initialize and process payment
 */
export const processPayment = async (
  options: PaymentOptions
): Promise<PaymentResult> => {
  const { payload, authToken, storeName, userDetails } = options;

  try {
    // Validate required data
    if (!payload.storeId) {
      throw new Error("Store ID is required");
    }

    if (!payload.selected_fulfillmentId) {
      throw new Error("Please select a delivery option");
    }

    if (!payload.address.name || !payload.address.phone) {
      throw new Error("Complete delivery address is required");
    }

    console.log("Starting payment process with payload:", {
      ...payload,
      address: { ...payload.address, phone: "***hidden***" }
    });

    // Step 1: Try primary payment initialization
    console.log("Attempting primary payment initialization...");
    let initResult = await initializePayment(authToken, payload);

    // Step 2: If primary fails, try alternative create-payment endpoint
    if (!initResult.success && payload.onselect_msgId) {
      console.log("Primary init failed, trying alternative endpoint...");
      const createResult = await createPaymentOrder(
        authToken, 
        payload.onselect_msgId, 
        payload.offerId
      );

      if (createResult.success && createResult.data) {
        // Transform the create-payment response to match expected format
        initResult = {
          success: true,
          data: {
            id: createResult.data.id,
            amount: createResult.data.amount,
            currency: createResult.data.currency || "INR",
            notes: createResult.data.notes || {
              orderId: createResult.data.receipt || createResult.data.id,
              storeId: payload.storeId,
              userId: "user"
            }
          }
        };
      }
    }

    if (!initResult.success || !initResult.data) {
      throw new Error(initResult.error || "Failed to initialize payment");
    }

    // Step 3: Process with Razorpay
    console.log("Processing Razorpay payment...");
    const paymentResult = await processRazorpayPayment(
      initResult.data,
      storeName,
      userDetails
    );

    return paymentResult;
  } catch (error: any) {
    console.error("Complete payment flow failed:", error);
    return {
      success: false,
      error: error.message || "Payment failed"
    };
  }
};

/**
 * Show payment success alert and navigate
 */
export const showPaymentSuccessAlert = (orderId: string) => {
  Alert.alert(
    "Payment Successful! 🎉",
    `Your order #${orderId} has been placed successfully.`,
    [
      {
        text: "View Order",
        style: "default",
        onPress: () => {
          router.push(`/orders/${orderId}`);
        },
      },
      {
        text: "Continue Shopping",
        style: "cancel",
        onPress: () => {
          router.push("/(tabs)/home/HomeScreen");
        },
      },
    ]
  );
};

/**
 * Show payment error alert
 */
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
        if (storeId) {
          router.push(`/(tabs)/cart?storeid=${storeId}`);
        }
      },
    },
  ];

  // Add retry option if callback provided
  if (onRetry) {
    buttons.unshift({
      text: "Retry",
      style: "default",
      onPress: onRetry,
    });
  }

  Alert.alert(
    "Payment Failed",
    `${error}\n\nIf money was deducted from your account, it will be refunded within 3-5 business days.`,
    buttons
  );
};

/**
 * Get user-friendly error message from error
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.description) return error.description;
  if (error?.message) return error.message;
  
  // Handle specific error codes
  if (error?.code) {
    const errorMap: { [key: string]: string } = {
      "30017": "Merchant is currently not taking orders",
      "30018": "Order not found",
      "30019": "Unable to confirm the order",
      "40002": "Selected quantity is not available",
      "40003": "This quote is no longer available",
      "40004": "Payment method not supported",
      "50001": "Cannot cancel order due to cancellation policy",
      "60001": "Pickup location not serviceable",
      "60002": "Delivery location not serviceable",
      "60003": "Delivery distance exceeds maximum limit",
      "60004": "Delivery partners not available",
    };
    
    return errorMap[error.code] || "Something went wrong. Please try again.";
  }
  
  return "Something went wrong. Please try again.";
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '₹0';
  }
  return `₹${price.toFixed(2).replace(/\.?0+$/, '')}`;
};

/**
 * Validate payment payload
 */
export const validatePaymentPayload = (payload: InitCartPayload): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!payload.storeId) errors.push("Store ID is required");
  if (!payload.selected_fulfillmentId) errors.push("Delivery option must be selected");
  if (!payload.addressId) errors.push("Address ID is required");
  if (!payload.onselect_msgId) errors.push("Message ID is required");

  // Validate address
  const { address } = payload;
  if (!address.name) errors.push("Delivery address name is required");
  if (!address.phone) errors.push("Phone number is required");
  if (!address.houseNo) errors.push("House/Building number is required");
  if (!address.street) errors.push("Street address is required");
  if (!address.city) errors.push("City is required");
  if (!address.state) errors.push("State is required");
  if (!address.pincode) errors.push("Pincode is required");

  // Validate phone number format (basic validation)
  if (address.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(address.phone)) {
    errors.push("Invalid phone number format");
  }

  // Validate pincode format (basic validation for Indian pincodes)
  if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
    errors.push("Invalid pincode format");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};