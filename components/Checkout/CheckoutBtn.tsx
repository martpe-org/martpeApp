import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCheckoutStore } from "@/state/useCheckoutStore";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "@/hook/useUserDetails";
import useDeliveryStore from "@/state/deliveryAddressStore";
import CheckoutContent from "./CheckoutContent";
import Loader from "../common/Loader";

const { height } = Dimensions.get("window");

interface CheckoutBtnProps {
  cart: FetchCartType;
}

const CheckoutBtn: React.FC<CheckoutBtnProps> = ({ cart }) => {
  const { userDetails } = useUserDetails();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  
  const {
    isOpen,
    loading,
    checkoutData,
    appliedOfferId,
    setOpen,
    setLoading,
    setCheckoutData,
  } = useCheckoutStore();

  // Reset when cart changes
  useEffect(() => {
    if (isOpen && cart && selectedDetails) {
      setCheckoutData(null);
      handleCheckout();
    }
  }, [selectedDetails]);

  const handleCheckout = async () => {
    if (!selectedDetails?.addressId) {
      Alert.alert(
        "Address Required",
        "Please add a delivery address to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!userDetails?.accessToken) {
      Alert.alert(
        "Login Required", 
        "Please login to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    setOpen(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/checkout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${userDetails.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: {
            bpp_id: cart.store.context.bpp_id,
            bpp_uri: cart.store.context.bpp_uri,
            core_version: cart.store.context.core_version,
            domain: cart.store.context.domain,
          },
          deliveryAddressId: selectedDetails.addressId,
          lat: selectedDetails.lat,
          lon: selectedDetails.lng,
          pincode: selectedDetails.pincode,
          location_id: cart.store.location_id,
          provider_id: cart.store.provider_id,
          storeId: cart.store._id,
          ...(appliedOfferId ? { offerId: appliedOfferId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Merchant is unavailable");
      }

      setCheckoutData(data.data);
    } catch (error: any) {
      console.error("Checkout error:", error);
      Alert.alert(
        "Checkout Failed",
        error.message || "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setCheckoutData(null);
  };

  // Calculate total items and price
  const totalItems = cart.items?.length || cart.cart_items?.length || 0;
  const totalPrice = cart.cartTotalPrice || 
    cart.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) ||
    cart.cart_items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;

  return (
    <>
      {/* Cart Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <Text style={styles.itemCount}>{totalItems} items</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>₹{totalPrice}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
        onPress={handleCheckout}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Loader/>
            <Text style={styles.btnText}>Checking Out...</Text>
          </View>
        ) : (
          <View style={styles.btnContainer}>
            <Text style={styles.btnText}>Continue to Checkout</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Checkout Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              {checkoutData ? (
                <CheckoutContent
                  cart={cart}
                  data={checkoutData}
                  appliedOfferId={appliedOfferId}
                  setOpen={setOpen}
                />
              ) : loading ? (
                <View style={styles.loadingContent}>
                  <Loader/>
                  <Text style={styles.loadingText}>Loading checkout details...</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CheckoutBtn;

const styles = StyleSheet.create({
  // Summary Card
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00BC66",
  },

  // Checkout Button
  checkoutBtn: {
    backgroundColor: "#00BC66",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#00BC66",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnDisabled: {
    backgroundColor: "#a0a0a0",
    shadowOpacity: 0.1,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    minHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeBtn: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});