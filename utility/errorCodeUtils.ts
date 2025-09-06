import { RetailsErrorCode } from "@/components/Checkout/retailsErrorCode";

/**
 * Gets user-friendly error message from error code
 */
export const getRetailsErrorMessage = (errorCode: string): string => {
  return RetailsErrorCode[errorCode as keyof typeof RetailsErrorCode] || 
         "Something went wrong. Please try again.";
};

/**
 * Common error messages for better UX
 */
export const getErrorMessage = (error: any): string => {
  // Handle error codes from retailers
  if (typeof error === 'string' && RetailsErrorCode[error as keyof typeof RetailsErrorCode]) {
    return getRetailsErrorMessage(error);
  }
  
  // Handle error objects
  if (error?.code && RetailsErrorCode[error.code as keyof typeof RetailsErrorCode]) {
    return getRetailsErrorMessage(error.code);
  }
  
  // Handle common error scenarios
  if (error?.message?.includes('network') || error?.message?.includes('Network')) {
    return "Network error. Please check your connection and try again.";
  }
  
  if (error?.message?.includes('timeout')) {
    return "Request timeout. Please try again.";
  }
  
  if (error?.message?.includes('401') || error?.message?.includes('authentication')) {
    return "Authentication failed. Please login again.";
  }
  
  if (error?.message?.includes('404')) {
    return "Requested resource not found.";
  }
  
  if (error?.message?.includes('500')) {
    return "Server error. Please try again later.";
  }
  
  // Return original message or default
  return error?.message || error?.description || "Something went wrong. Please try again.";
};