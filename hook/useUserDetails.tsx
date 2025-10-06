import { useEffect, useState, useRef } from "react";
import {
  getAsyncStorageItem,
  removeAsyncStorageItem,
  setAsyncStorageItem,
} from "../utility/asyncStorage";
import { deepEqual } from "../utility/deepEqual";

interface UserDetails {
  _id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode?: string;
  dob?: string;
  gender?: string;
}

interface DeliveryDetails {
  city?: string;
  pincode?: string;
  [key: string]: any;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  countryCode: string;
  dob: string;
  gender: string;
}

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliveryDetails, setDeliveryDetails] =
    useState<DeliveryDetails | null>(null);

  // form state synced with userDetails
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    countryCode: "",
    dob: "",
    gender: "",
  });

  // 🚦 Prevent reinitialization loops
  const userInitRef = useRef(false);
  const deliveryInitRef = useRef(false);

  useEffect(() => {
    initializeUserDetails();
    initializeDeliveryDetails();
  }, []);

  // ---------------------------
  // USER DETAILS
  // ---------------------------
  const initializeUserDetails = async () => {
    if (userInitRef.current) return;
    userInitRef.current = true;

    try {
      setIsLoading(true);
      const details = await getAsyncStorageItem("userDetails");

      if (details) {
        const parsedDetails = JSON.parse(details) as UserDetails;
        setUserDetails((prev) =>
          !deepEqual(prev, parsedDetails) ? parsedDetails : prev
        );
        setIsAuthenticated(true);

        // sync form data
        setFormData({
          firstName: parsedDetails.firstName || "",
          lastName: parsedDetails.lastName || "",
          email: parsedDetails.email || "",
          password: "",
          countryCode: parsedDetails.countryCode || "",
          dob: parsedDetails.dob || "",
          gender: parsedDetails.gender || "",
        });
      } else {
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
      setUserDetails((prev) =>
        !deepEqual(prev, details) ? details : prev
      );
      setIsAuthenticated(true);

      // sync form data
      setFormData({
        firstName: details.firstName || "",
        lastName: details.lastName || "",
        email: details.email || "",
        password: "",
        countryCode: details.countryCode || "",
        dob: details.dob || "",
        gender: details.gender || "",
      });
    } catch (error) {
      console.error("Error saving user details:", error);
    }
  };

  const getUserDetails = async (): Promise<UserDetails | null> => {
    try {
      const details = await getAsyncStorageItem("userDetails");
      if (details) {
        const parsedDetails = JSON.parse(details) as UserDetails;
        setUserDetails((prev) =>
          !deepEqual(prev, parsedDetails) ? parsedDetails : prev
        );
        setIsAuthenticated(true);

        // sync form data
        setFormData({
          firstName: parsedDetails.firstName || "",
          lastName: parsedDetails.lastName || "",
          email: parsedDetails.email || "",
          password: "",
          countryCode: parsedDetails.countryCode || "",
          dob: parsedDetails.dob || "",
          gender: parsedDetails.gender || "",
        });

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
      userInitRef.current = false;

      // reset form data
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        countryCode: "",
        dob: "",
        gender: "",
      });

      console.log("User details removed successfully");
    } catch (error) {
      console.error("Error removing user details:", error);
    }
  };

  const checkAuthentication = () => {
    return !!(isAuthenticated && userDetails?.accessToken);
  };

const initializeDeliveryDetails = async () => {
  if (deliveryInitRef.current) return;
  deliveryInitRef.current = true;

  try {
    const details = await getAsyncStorageItem("deliveryDetails");
    if (details) {
      const parsedDetails = JSON.parse(details) as DeliveryDetails;
      setDeliveryDetails((prev) =>
        !deepEqual(prev, parsedDetails) ? parsedDetails : prev
      );
    }
    // ❌ No console.log here anymore
  } catch (error) {
    console.error("Error initializing delivery details:", error);
  }
};


  const saveDeliveryDetails = async (details: DeliveryDetails) => {
    try {
      await setAsyncStorageItem("deliveryDetails", JSON.stringify(details));
      setDeliveryDetails((prev) =>
        !deepEqual(prev, details) ? details : prev
      );
    } catch (error) {
      console.error("Error saving delivery details:", error);
    }
  };

  const removeDeliveryDetails = async () => {
    try {
      await removeAsyncStorageItem("deliveryDetails");
      setDeliveryDetails(null);
      deliveryInitRef.current = false;
      console.log("Delivery details removed successfully");
    } catch (error) {
      console.error("Error removing delivery details:", error);
    }
  };

  // ---------------------------
  // RETURN
  // ---------------------------
  return {
    // User
    userDetails,
    authToken: userDetails?.accessToken || null,
    isLoading,
    isAuthenticated,
    formData,
    setFormData,
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
