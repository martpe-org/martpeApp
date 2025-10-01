import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "@/hook/useUserDetails";
import { fetchCarts } from "@/app/(tabs)/cart/fetch-carts";
import Loader from "@/components/common/Loader";
import CheckoutContent from "@/components/Checkout/CheckoutContent";
import { MaterialIcons } from "@expo/vector-icons";
import { useCheckoutStore } from "@/state/useCheckoutStore";
import useDeliveryStore from "@/components/address/deliveryAddressStore";
import { useToast } from "react-native-toast-notifications";

interface CheckoutModalProps {
  cartId: string;
  storeId: string;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cartId,
  storeId,
  onClose,
}) => {
  const {
    userDetails,
    isLoading: userLoading,
    isAuthenticated,
  } = useUserDetails();

  const [cart, setCart] = useState<FetchCartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    checkoutData,
    appliedOfferId,
    setCheckoutData,
    setLoading: setCheckoutLoading,
  } = useCheckoutStore();

  const selectedDetails = useDeliveryStore((s) => s.selectedDetails);
  const toast = useToast();

  useEffect(() => {
    if (userLoading) return;

    if (!cartId) {
      toast?.show?.("No cart ID provided", { type: "danger", duration: 2000 });
      onClose();
      return;
    }

    if (!isAuthenticated || !userDetails?.accessToken) {
      toast?.show?.("Please login to continue", { type: "danger", duration: 2000 });
      onClose();
      return;
    }

    if (!selectedDetails || !selectedDetails.addressId) {
      toast?.show?.("Drop-off location is not serviceable by the provider", {
        type: "warning",
        placement: "top",
        duration: 3000,
      });
      onClose();
      return;
    }

    fetchCartData();
  }, [cartId, userLoading, isAuthenticated, userDetails, selectedDetails]);

  const fetchCartData = async () => {
    setLoading(true);
    try {
      if (!userDetails?.accessToken) throw new Error("No access token");

      const carts = await fetchCarts(userDetails.accessToken);
      const targetCart = carts?.find((c) => c._id === cartId);
      if (!targetCart) throw new Error("Cart not found");

      const itemsToCheck = targetCart.items || targetCart.cart_items || [];
      if (!itemsToCheck.length) throw new Error("Cart is empty");

      setCart(targetCart);

      setCheckoutLoading(true);

      const payload = {
        context: {
          bpp_id: targetCart.store.context?.bpp_id,
          bpp_uri: targetCart.store.context?.bpp_uri,
          core_version: targetCart.store.context?.core_version,
          domain: targetCart.store.context?.domain,
        },
        deliveryAddressId: selectedDetails.addressId,
        lat: selectedDetails.lat ?? 0,
        lon: selectedDetails.lng ?? 0,
        pincode: selectedDetails.pincode ?? "",
        location_id: targetCart.store.location_id,
        provider_id: targetCart.store.provider_id,
        storeId: targetCart.store._id,
        ...(appliedOfferId ? { offerId: appliedOfferId } : {}),
      };

      const url = `${process.env.EXPO_PUBLIC_API_URL}/select-cart`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userDetails.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON from server: ${text}`);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || `Server responded ${response.status}`);
      }

      setCheckoutData(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load checkout");
      toast?.show?.(err.message || "Unable to start checkout", {
        type: "danger",
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setCheckoutLoading(false);
    }
  };

  if (loading || userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Checkout</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Loader />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </SafeAreaView>
    );
  }

  if (error || !cart) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Checkout</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error || "Unable to load checkout"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Checkout</Text>
<View style={styles.shadowWrapper}>
  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
    <MaterialIcons name="close" size={18} color="red" />
    <Text style={styles.closeText}>Close</Text>
  </TouchableOpacity>
</View>

      </View>

      {checkoutData ? (
        <CheckoutContent
          cart={cart}
          data={checkoutData}
          appliedOfferId={appliedOfferId}
          setOpen={onClose}
        />
      ) : (
        <Loader />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: { fontSize: 22, fontWeight: "bold",fontStyle:"italic" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666", textAlign: "center" },
  errorContainer: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 20,
  },
shadowWrapper: {
  borderRadius: 28,       // same as button
  backgroundColor: 'transparent', // needed so button color shows
  
  // iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 4.65,

  // Android elevation
  elevation: 6,
},
closeButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
  borderRadius: 28,
  paddingVertical: 6,
  paddingHorizontal: 12,
},


  closeText: {
    color: "red",
    fontSize: 13,
    fontWeight: "600",
  },
  errorTitle: {
    fontSize: 20, 
    fontWeight: "600", 
    color: "#d73a49", 
    marginBottom: 8, 
    textAlign: "center",
  },
  errorText: { 
    fontSize: 16, 
    color: "#666", 
    textAlign: "center", 
    lineHeight: 24 
  },
});

export default CheckoutModal;