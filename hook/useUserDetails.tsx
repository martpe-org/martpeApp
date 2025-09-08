import { useEffect, useState } from "react";
import {
  getAsyncStorageItem,
  removeAsyncStorageItem,
  setAsyncStorageItem,
} from "../utility/asyncStorage";

interface UserDetails {
  _id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface DeliveryDetails {
  city?: string;
  pincode?: string;
  [key: string]: any;
}

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [deliveryDetails, setDeliveryDetails] =
    useState<DeliveryDetails | null>(null);

  useEffect(() => {
    initializeUserDetails();
    initializeDeliveryDetails();
  }, []);

  // ---------------------------
  // USER DETAILS
  // ---------------------------
  const initializeUserDetails = async () => {
    try {
      setIsLoading(true);
      const details = await getAsyncStorageItem("userDetails");
      if (details) {
        const parsedDetails = JSON.parse(details) as UserDetails;
        setUserDetails(parsedDetails);
        setIsAuthenticated(true);
        console.log("User details loaded from storage:", parsedDetails);
      } else {
        console.log("No user details found in storage");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error initializing user details:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserDetails = async (details: UserDetails) => {
    try {
      await setAsyncStorageItem("userDetails", JSON.stringify(details));
      setUserDetails(details);
      setIsAuthenticated(true);
      console.log("User details saved successfully:", details);
    } catch (error) {
      console.error("Error saving user details:", error);
    }
  };

  const getUserDetails = async (): Promise<UserDetails | null> => {
    try {
      const details = await getAsyncStorageItem("userDetails");
      if (details) {
        const parsedDetails = JSON.parse(details) as UserDetails;
        setUserDetails(parsedDetails);
        setIsAuthenticated(true);
        return parsedDetails;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving user details:", error);
      return null;
    }
  };

  const removeUserDetails = async () => {
    try {
      await removeAsyncStorageItem("userDetails");
      setUserDetails(null);
      setIsAuthenticated(false);
      console.log("User details removed successfully");
    } catch (error) {
      console.error("Error removing user details:", error);
    }
  };

  const checkAuthentication = () => {
    return !!(isAuthenticated && userDetails?.accessToken);
  };

  // ---------------------------
  // DELIVERY DETAILS
  // ---------------------------
  const initializeDeliveryDetails = async () => {
    try {
      const details = await getAsyncStorageItem("deliveryDetails");
      if (details) {
        const parsedDetails = JSON.parse(details) as DeliveryDetails;
        setDeliveryDetails(parsedDetails);
        console.log("Delivery details loaded from storage:", parsedDetails);
      } else {
        console.log("No delivery details found in storage"); // ✅ Always logs this
      }
    } catch (error) {
      console.error("Error initializing delivery details:", error);
    }
  };

  const saveDeliveryDetails = async (details: DeliveryDetails) => {
    try {
      await setAsyncStorageItem("deliveryDetails", JSON.stringify(details));
      setDeliveryDetails(details);
      console.log("Delivery details saved successfully:", details);
    } catch (error) {
      console.error("Error saving delivery details:", error);
    }
  };

  const removeDeliveryDetails = async () => {
    try {
      await removeAsyncStorageItem("deliveryDetails");
      setDeliveryDetails(null);
      console.log("Delivery details removed successfully");
    } catch (error) {
      console.error("Error removing delivery details:", error);
    }
  };

  // ---------------------------
  return {
    // User
    userDetails,
    authToken: userDetails?.accessToken || null,
    isLoading,
    isAuthenticated,
    saveUserDetails,
    getUserDetails,
    removeUserDetails,
    checkAuthentication,
    refreshUserDetails: initializeUserDetails,

    // Delivery
    deliveryDetails,
    saveDeliveryDetails,
    removeDeliveryDetails,
    refreshDeliveryDetails: initializeDeliveryDetails,
  };
};

export default useUserDetails;
