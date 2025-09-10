import useDeliveryStore from "@/components/address/deliveryAddressStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ToastProvider } from "react-native-toast-notifications";
import useUserDetails from "../hook/useUserDetails";
import { isTokenValid } from "../utility/token";

export default function Page() {
  const { userDetails, getUserDetails } = useUserDetails();
  const { loadDeliveryDetails } = useDeliveryStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Create QueryClient once
  const [queryClient] = useState(() => new QueryClient());

  // ✅ Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing app...");
        await getUserDetails();
        await loadDeliveryDetails(); // ✅ Load saved address
        console.log("App initialization complete");
      } catch (error) {
        console.error("App initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [getUserDetails, loadDeliveryDetails]);

  // ✅ Handle authentication state changes
  useEffect(() => {
    console.log("User details updated:", userDetails);

    if (!userDetails) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    const { accessToken, refreshToken } = userDetails;
    const isAccessTokenValid = isTokenValid(accessToken);
    const isRefreshTokenValid = isTokenValid(refreshToken);

    console.log("Token validation:", {
      isAccessTokenValid,
      isRefreshTokenValid,
    });

    setIsLoggedIn(isAccessTokenValid || isRefreshTokenValid);
    setIsLoading(false);
  }, [userDetails]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {isLoggedIn ? (
          <Redirect href={"/(tabs)/home/HomeScreen"} />
        ) : (
          <Redirect href={"./(auth)/"} />
        )}
      </ToastProvider>
    </QueryClientProvider>
  );
}
