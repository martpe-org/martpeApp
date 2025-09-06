// Simple utility functions for React Native checkout
export const prettifyTemporalDuration = (duration: string): string => {
  // Simple duration formatter - convert ISO 8601 duration to readable format
  if (!duration || duration === "P0D") return "Same day";
  
  // Extract days, hours, minutes from ISO 8601 duration (e.g., "P1DT2H30M")
  const match = duration.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);
  
  if (!match) return duration;
  
  const days = parseInt(match[1] || "0");
  const hours = parseInt(match[2] || "0");
  const minutes = parseInt(match[3] || "0");
  
  const parts = [];
  
  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  
  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  }
  
  return parts.length > 0 ? parts.slice(0, 2).join(' ') : "Same day";
};

export const formatPrice = (price: number): string => {
  return `₹${price.toFixed(2).replace(/\.?0+$/, '')}`;
};

export const calculateItemTotal = (unitPrice: number, quantity: number): number => {
  return Math.round((unitPrice * quantity) * 100) / 100;
};

export const validateAddress = (address: any): boolean => {
  return !!(
    address?.name &&
    address?.houseNo &&
    address?.street &&
    address?.city &&
    address?.pincode &&
    address?.phone
  );
};

export const validateCart = (cart: any): boolean => {
  if (!cart?.store?._id) return false;
  
  const items = cart.items || cart.cart_items || [];
  return items.length > 0;
};

// Error codes mapping for better error messages
export const getErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
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
  
  return errorMessages[errorCode] || "Something went wrong. Please try again.";
};