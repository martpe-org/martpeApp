import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCheckoutStore } from "@/state/useCheckoutStore";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "@/hook/useUserDetails";
import useDeliveryStore from "@/state/deliveryAddressStore";
import CheckoutContent from "./CheckoutContent";
import Loader from "../common/Loader";
import { router } from "expo-router";

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
      } catch (err) {
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

  const formatCurrency = (amt: number) =>
    `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;

  // Calculate total items and price
  const totalItems = cart.items?.length || cart.cart_items?.length || 0;
  const totalPrice =
    cart.cartTotalPrice ||
    cart.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) ||
    cart.cart_items?.reduce((sum, item) => sum + (item.total_price || 0), 0) ||
    0;

  return (
    <>
      {/* Detailed Cart Display */}
      <ScrollView
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Information */}
        <View style={styles.storeSection}>
          <TouchableOpacity
            style={styles.storeHeader}
            onPress={() =>
              router.push(
                `/(tabs)/home/result/productListing/${cart.store.slug}`
              )
            }
            activeOpacity={0.7}
          >
            {cart.store?.symbol && (
              <Image
                source={{ uri: cart.store.symbol }}
                style={styles.storeLogo}
                onError={() => console.warn("Failed to load store image")}
              />
            )}
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>
                {cart.store.name || "Unknown Store"}
              </Text>
              {cart.store.address?.street && (
                <Text style={styles.storeAddress}>
                  📍 {cart.store.address.street}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items ({totalItems})</Text>

          {(cart.items || cart.cart_items || []).map((item, index) => {
            if (!item || !item._id) return null;

            const productName = item.product?.name || "Unknown Product";
            const productImage = item.product?.symbol;
            const unitPrice = item.unit_price || 0;
            const quantity = item.qty || 1;
            const itemTotal = unitPrice * quantity;

            return (
              <View key={item._id || index} style={styles.itemCard}>
                <TouchableOpacity
                  style={styles.itemContent}
                  onPress={() => {
                    if (item.product?.slug) {
                      router.push(
                        `/(tabs)/home/result/productDetails/${item.product.slug}`
                      );
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {/* Product Image */}
                  <View style={styles.itemImageContainer}>
                    {productImage ? (
                      <Image
                        source={{ uri: productImage }}
                        style={styles.itemImage}
                        onError={() =>
                          console.warn("Failed to load product image")
                        }
                      />
                    ) : (
                      <View style={[styles.itemImage, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>IMG</Text>
                      </View>
                    )}
                  </View>

                  {/* Product Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {productName}
                    </Text>
                    <Text style={styles.itemPrice}>
                      Unit: {formatCurrency(unitPrice)}
                    </Text>
                    <Text style={styles.itemQuantity}>Qty: {quantity}</Text>
                    <Text style={styles.itemTotal}>
                      Total: {formatCurrency(itemTotal)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },

  // Store Section
  storeSection: {
    backgroundColor: "white",
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: "#666",
  },

  // Items Section
  itemsSection: {
    backgroundColor: "white",
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  itemCard: {
    marginBottom: 8,
    marginHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    overflow: "hidden",
  },
  itemContent: {
    flexDirection: "row",
    padding: 12,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00BC66",
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
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

  // Checkout Button Container
  checkoutButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#f8f9fa",
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
    maxHeight: height * 2,
    minHeight: height * 0.9,
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
