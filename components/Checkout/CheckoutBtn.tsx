import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import useDeliveryStore from "@/components/address/deliveryAddressStore";
import useUserDetails from "@/hook/useUserDetails";
import { useCheckoutStore } from "@/state/useCheckoutStore";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Loader from "../common/Loader";
import CheckoutContent from "./CheckoutContent";
import CheckoutStoreSection from "./CheckoutStoreSection";
import CheckoutItemsSection from "./CheckoutItemsSection";
import CheckoutSummarySection from "./CheckoutSummarySection";
import { styles } from "./CheckoutBtnStyles";
import { useToast } from "react-native-toast-notifications";

interface CheckoutBtnProps {
  cart: FetchCartType;
}

const CheckoutBtn: React.FC<CheckoutBtnProps> = ({ cart }) => {
  const { userDetails } = useUserDetails();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const toast = useToast()
  const {
    isOpen,
    loading,
    checkoutData,
    appliedOfferId,
    setOpen,
    setLoading,
    setCheckoutData,
  } = useCheckoutStore();

  const handleCheckout = async () => {
    if (!selectedDetails || !selectedDetails.addressId) {
      toast.show("Drop-off location is not serviceable by the provider", {
        type: "warning",
        placement: "top",
        duration: 3000,
      });
      return;
    }
    if (!userDetails?.accessToken) {
      return;
    }

    setLoading(true);
    setOpen(true);
    try {
      // build the payload
      const payload = {
        context: {
          bpp_id: cart.store.context?.bpp_id,
          bpp_uri: cart.store.context?.bpp_uri,
          core_version: cart.store.context?.core_version,
          domain: cart.store.context?.domain,
        },
        deliveryAddressId: selectedDetails.addressId,
        lat: selectedDetails.lat,
        lon: selectedDetails.lng,
        pincode: selectedDetails.pincode,
        location_id: cart.store.location_id,
        provider_id: cart.store.provider_id,
        storeId: cart.store._id,
        ...(appliedOfferId ? { offerId: appliedOfferId } : {}),
      };

      const url = `${process.env.EXPO_PUBLIC_API_URL}/select-cart`; // or whatever your Next route is

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userDetails.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // clone and log what the server returned
      const text = await response.text();

      // parse JSON safely
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error(`Invalid JSON from server: ${text}`);
      }

      if (!response.ok || data.error) {
        throw new Error(
          data.error?.message || `Server responded ${response.status}`
        );
      }

      setCheckoutData(data.data);
    } catch (error: any) {
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
  const totalPrice =
    cart.cartTotalPrice ||
    cart.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) ||
    cart.cart_items?.reduce((sum, item) => sum + (item.total_price || 0), 0) ||
    0;

  // Determine which items array to use
  const itemsToShow = cart.items || cart.cart_items || [];

  return (
    <>
      {/* Detailed Cart Display */}
      <ScrollView
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Information */}
        <CheckoutStoreSection store={cart.store} />

        {/* Items Section */}
        <CheckoutItemsSection items={itemsToShow} />

        {/* Order Summary */}
        <CheckoutSummarySection
          totalItems={totalItems}
          totalPrice={totalPrice}
        />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutButtonContainer}>
        <TouchableOpacity
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={loading ? styles.loadingContainer : styles.btnContainer}>
            {loading ? (
              <>
                <Loader />
                <Text style={styles.btnText}>Checking Out...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="payment" size={20} color="#ffffff" />
                <Text style={styles.btnText}>Continue to Checkout</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Checkout Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
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
                  <Loader />
                  <Text style={styles.loadingText}>
                    Loading checkout details...
                  </Text>
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

