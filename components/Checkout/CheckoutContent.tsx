import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SelectData, useCheckoutStore } from "@/state/useCheckoutStore";
import {
  CartItemType,
  FetchCartStore,
  FetchCartType,
} from "@/app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "@/hook/useUserDetails";
import { useCartStore } from "@/state/useCartStore";
import { prettifyTemporalDuration } from "@/utility/CheckoutUtils";
import Loader from "../common/Loader";
import { BillSummary } from "./BillSummary";
import { CancellationPolicy } from "./CancellationPolicy";
import {
  processRazorpayPayment,
  showPaymentSuccessAlert,
  showPaymentErrorAlert,
  getErrorMessage,
} from "./paymentUtils";

interface CheckoutContentProps {
  data: SelectData;
  cart: FetchCartType;
  appliedOfferId?: string;
  id: string;
  store: FetchCartStore;
  items: CartItemType[];
  setOpen: (open: boolean) => void;
}

const CheckoutContent: React.FC<CheckoutContentProps> = ({
  data,
  cart,
  store,
  appliedOfferId,
  setOpen,
}) => {
  const { userDetails } = useUserDetails();
  const { removeCart } = useCartStore();
  const { selectedFulfillment, setSelectedFulfillment } = useCheckoutStore();
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { items, fulfillments, breakups, sub_total } = data;
  const selectedBreakup =
    breakups[selectedFulfillment] || Object.values(breakups)[0];
  const selectedFulfillmentId =
    selectedFulfillment || fulfillments[0]?.id || "";

  const handlePayment = async () => {
    if (!selectedFulfillmentId) {
      showPaymentErrorAlert("Please select a delivery option to continue.");
      return;
    }

    if (!userDetails?.accessToken) {
      showPaymentErrorAlert("Please login again to continue.");
      return;
    }

    setPaymentLoading(true);

    try {
      const payload = {
        address: data.address,
        onselect_msgId: data.context.message_id,
        storeId: cart.store._id,
        addressId: data.addressId,
        selected_fulfillmentId: selectedFulfillmentId,
        ...(appliedOfferId ? { offerId: appliedOfferId } : {}),
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userDetails.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      let result: any;

      try {
        result = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid response from server`);
      }

      if (!response.ok || result.error) {
        throw new Error(
          result.error?.message || `Server error: ${response.status}`
        );
      }

      if (!result.data?.id) {
        throw new Error("Invalid payment response");
      }

      // Process payment with Razorpay
      const paymentResult = await processRazorpayPayment({
        rpOrderId: result.data.id,
        orderId: result.data.notes?.orderId || result.data.id,
        amount: result.data.amount / 100,
        storeName: cart.store.name,
        userDetails: {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email,
          phoneNumber: userDetails.phoneNumber,
        },
      });

      if (paymentResult.success) {
        setOpen(false);
        removeCart(cart.store._id, userDetails.accessToken);
        showPaymentSuccessAlert(paymentResult.orderId!);
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      showPaymentErrorAlert(getErrorMessage(error), cart.store._id);
    } finally {
      setPaymentLoading(false);
    }
  };

  const hasOutOfStockItems = items.some((item) => !item.instock);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Store Details */}
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          const slug = store?.slug || cart?.store?.slug;
          if (slug) {
            router.push(`/(tabs)/home/result/productListing/${slug}`);
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>Store Details</Text>
        <View style={styles.storeCard}>
          <Image
            source={{ uri: cart.store.symbol }}
            style={styles.storeImage}
          />
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{cart.store.name}</Text>
            <Text style={styles.storeAddress} numberOfLines={2}>
              {cart.store.address.street}, {cart.store.address.city}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Delivery Address */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/address/savedAddresses")}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#666" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.addressCard}>
          <Text style={styles.addressName}>{data.address.name}</Text>
          <Text style={styles.addressText}>
            {data.address.houseNo}, {data.address.street}, {data.address.city},{" "}
            {data.address.state} - {data.address.pincode}
          </Text>
          <Text style={styles.addressPhone}>Phone: {data.address.phone}</Text>
        </View>
      </View>

      {/* Cart Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
        {/* productDetails routing here */}
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              style={styles.itemCard}
              onPress={() =>
                router.push(
                  `/(tabs)/home/result/productDetails/${item.product.slug}`
                )
              }
            >
              <Image
                source={{ uri: item.product.symbol }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text
                  style={[styles.itemQty, !item.instock && styles.outOfStock]}
                >
                  Qty: {item.instock ? item.cart_qty : "unavailable"}
                </Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.total_price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Delivery Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Options</Text>
        <View style={styles.fulfillmentContainer}>
          {fulfillments.map((fulfillment: any) => (
            <TouchableOpacity
              key={fulfillment.id}
              style={[
                styles.fulfillmentOption,
                selectedFulfillmentId === fulfillment.id &&
                  styles.selectedFulfillment,
              ]}
              onPress={() => setSelectedFulfillment(fulfillment.id)}
            >
              <View
                style={[
                  styles.radio,
                  selectedFulfillmentId === fulfillment.id &&
                    styles.radioSelected,
                ]}
              />
              <View style={styles.fulfillmentDetails}>
                <Text style={styles.fulfillmentText}>
                  {fulfillment.category}
                </Text>
                <Text style={styles.fulfillmentTime}>
                  Est. Delivery:{" "}
                  {prettifyTemporalDuration(fulfillment.tat || "P0D")}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bill Summary Component */}
      <View style={styles.section}>
        <BillSummary
          subTotal={sub_total}
          breakups={selectedBreakup.breakups}
          totalSavings={selectedBreakup.total_savings}
          grandTotal={selectedBreakup.total}
        />
      </View>

      {/* Cancellation Policy Component */}
      <View style={styles.section}>
        <CancellationPolicy isCancellable />
      </View>

      {/* Out of Stock Message */}
      {hasOutOfStockItems && (
        <View style={styles.outOfStockSection}>
          <MaterialIcons name="info" size={24} color="#f39c12" />
          <Text style={styles.outOfStockMessage}>
            Some items in your cart are out of stock. Please remove them to
            continue.
          </Text>
        </View>
      )}

      {/* Payment Button */}
      {!hasOutOfStockItems && (
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[
              styles.paymentBtn,
              (!selectedFulfillmentId || paymentLoading) &&
                styles.paymentBtnDisabled,
            ]}
            onPress={handlePayment}
            disabled={!selectedFulfillmentId || paymentLoading}
          >
            {paymentLoading ? (
              <View style={styles.loadingContainer}>
                <Loader />
                <Text style={styles.paymentBtnText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.paymentContainer}>
                <Text style={styles.paymentBtnText}>
                  Proceed to Payment • ₹{selectedBreakup.total}
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default CheckoutContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  editText: {
    fontSize: 12,
    color: "#666",
  },
  storeCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: "#666",
  },
  addressCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
  },
  itemsContainer: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 14,
    color: "#666",
  },
  outOfStock: {
    color: "#e74c3c",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  fulfillmentContainer: {
    gap: 12,
  },
  fulfillmentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedFulfillment: {
    borderColor: "#00BC66",
    backgroundColor: "#f0fdf4",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    marginRight: 12,
  },
  radioSelected: {
    borderColor: "#00BC66",
    backgroundColor: "#00BC66",
  },
  fulfillmentDetails: {
    flex: 1,
  },
  fulfillmentText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  fulfillmentTime: {
    fontSize: 14,
    color: "#666",
  },
  paymentSection: {
    paddingVertical: 16,
  },
  paymentBtn: {
    backgroundColor: "#00BC66",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#00BC66",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  paymentBtnDisabled: {
    backgroundColor: "#a0a0a0",
    shadowOpacity: 0.1,
  },
  paymentContainer: {
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
  paymentBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  outOfStockSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
  },
  outOfStockMessage: {
    flex: 1,
    fontSize: 14,
    color: "#856404",
  },
});
