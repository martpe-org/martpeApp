import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import RazorpayCheckout from "expo-razorpay";
import { SelectData, useCheckoutStore } from "@/state/useCheckoutStore";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "@/hook/useUserDetails";
import { useCartStore } from "@/state/useCartStore";
import { prettifyTemporalDuration } from "@/utility/CheckoutUtils";
import Loader from "../common/Loader";

interface CheckoutContentProps {
  data: SelectData;
  cart: FetchCartType;
  appliedOfferId?: string;
  setOpen: (open: boolean) => void;
}

const CheckoutContent: React.FC<CheckoutContentProps> = ({
  data,
  cart,
  appliedOfferId,
  setOpen,
}) => {
  const { userDetails } = useUserDetails();
  const { removeCart } = useCartStore();
  const { selectedFulfillment, setSelectedFulfillment, paymentLoading, setPaymentLoading } = useCheckoutStore();

  const { items, fulfillments, breakups, sub_total } = data;
  const selectedBreakup = breakups[selectedFulfillment] || Object.values(breakups)[0];
  const selectedFulfillmentId = selectedFulfillment || fulfillments[0]?.id || "";

  const processPayment = useCallback(async (
    rpOrderId: string,
    orderId: string,
    amount: number,
    storeName: string
  ) => {
    try {
      const options = {
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_28OLg2dI6uOgm3",
        amount: amount * 100, // Convert to paisa
        currency: "INR",
        name: "Martpe",
        description: `Payment for ${storeName} - Order #${orderId}`,
        order_id: rpOrderId,
        prefill: {
          name: `${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`.trim(),
          email: userDetails?.email || "",
          contact: userDetails?.phoneNumber || "",
        },
        theme: { color: "#00BC66" },
      };

      const paymentResult = await RazorpayCheckout.open(options);
      
      // Payment successful
      setOpen(false);
      removeCart(cart.store._id, userDetails?.accessToken || "");
      
      Alert.alert(
        "Payment Successful!",
        `Order #${orderId} has been placed successfully.`,
        [
          {
            text: "View Order",
            onPress: () => router.push(`/orders/${orderId}`),
          },
        ]
      );
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentLoading(false);
      
      Alert.alert(
        "Payment Failed",
        "Payment failed! If money was deducted, it will be refunded within 3-5 business days.",
        [
          {
            text: "OK",
            onPress: () => router.push(`/cart?storeid=${cart.store._id}`),
          },
        ]
      );
    }
  }, [userDetails, cart, setOpen, removeCart, setPaymentLoading]);

  const handlePayment = async () => {
    setPaymentLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payment`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${userDetails?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: data.address,
          onselect_msgId: data.context.message_id,
          storeId: cart.store._id,
          addressId: data.addressId,
          selected_fulfillmentId: selectedFulfillmentId,
          ...(appliedOfferId ? { offerId: appliedOfferId } : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error?.message || "Payment initialization failed");
      }

      await processPayment(
        result.data.id,
        result.data.notes.orderId,
        result.data.amount / 100, // Convert from paisa
        cart.store.name
      );
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      setPaymentLoading(false);
      Alert.alert("Error", error.message || "Something went wrong! Please try again.");
    }
  };

  const hasOutOfStockItems = items.some((item) => !item.instock);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Store Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Details</Text>
        <View style={styles.storeCard}>
          <Image source={{ uri: cart.store.symbol }} style={styles.storeImage} />
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{cart.store.name}</Text>
            <Text style={styles.storeAddress} numberOfLines={2}>
              {cart.store.address.street}, {cart.store.address.locality}, {cart.store.address.city}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil" size={16} color="#666" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.addressCard}>
          <Text style={styles.addressName}>{data.address.name}</Text>
          <Text style={styles.addressText}>
            {data.address.houseNo}, {data.address.street}, {data.address.city}, {data.address.state} - {data.address.pincode}
          </Text>
          <Text style={styles.addressPhone}>Phone: {data.address.phone}</Text>
        </View>
      </View>

      {/* Cart Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.itemCard}>
              <Image source={{ uri: item.product.symbol }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={[styles.itemQty, !item.instock && styles.outOfStock]}>
                  Qty: {item.instock ? item.cart_qty : "unavailable"}
                </Text>
                {item.product.variant_info && (
                  <Text style={styles.variantInfo}>{item.product.variant_info}</Text>
                )}
                {item.selected_customizations && item.selected_customizations.length > 0 && (
                  <Text style={styles.customizations}>
                    Customizations: {item.selected_customizations.map(c => c.name).join(", ")}
                  </Text>
                )}
              </View>
              <Text style={styles.itemPrice}>₹{item.total_price}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Delivery Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Options</Text>
        <View style={styles.fulfillmentContainer}>
          {fulfillments.map((fulfillment:any) => (
            <TouchableOpacity
              key={fulfillment.id}
              style={[
                styles.fulfillmentOption,
                selectedFulfillmentId === fulfillment.id && styles.selectedFulfillment,
              ]}
              onPress={() => setSelectedFulfillment(fulfillment.id)}
            >
              <View style={[
                styles.radio,
                selectedFulfillmentId === fulfillment.id && styles.radioSelected,
              ]} />
              <View style={styles.fulfillmentDetails}>
                <Text style={styles.fulfillmentText}>
                  {fulfillment.category}
                </Text>
                <Text style={styles.fulfillmentTime}>
                  Est. Delivery: {prettifyTemporalDuration(fulfillment.tat || "P0D")}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{sub_total}</Text>
          </View>
          
          {selectedBreakup.breakups.map((breakup, index) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {breakup.custom_title || breakup.title}
              </Text>
              <Text style={styles.summaryValue}>₹{breakup.price}</Text>
            </View>
          ))}
          
          {selectedBreakup.total_savings > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.savingsText]}>Total Savings</Text>
              <Text style={[styles.summaryValue, styles.savingsText]}>-₹{selectedBreakup.total_savings}</Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{selectedBreakup.total}</Text>
          </View>
        </View>
      </View>

      {/* Payment Button */}
      {!hasOutOfStockItems && (
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[styles.paymentBtn, (!selectedFulfillmentId || paymentLoading) && styles.paymentBtnDisabled]}
            onPress={handlePayment}
            disabled={!selectedFulfillmentId || paymentLoading}
            activeOpacity={0.8}
          >
            {paymentLoading ? (
              <View style={styles.loadingContainer}>
                <Loader />
                <Text style={styles.paymentBtnText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.paymentContainer}>
                <Text style={styles.paymentBtnText}>Proceed to Payment</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Out of Stock Message */}
      {hasOutOfStockItems && (
        <View style={styles.outOfStockSection}>
          <MaterialIcons name="info" size={24} color="#f39c12" />
          <Text style={styles.outOfStockMessage}>
            Some items in your cart are out of stock. Please remove them to continue.
          </Text>
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
    marginBottom: 24,
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

  // Store Card
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
    lineHeight: 20,
  },

  // Address Card
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
    lineHeight: 20,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
  },

  // Items
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
    marginBottom: 2,
  },
  outOfStock: {
    color: "#e74c3c",
  },
  variantInfo: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  customizations: {
    fontSize: 12,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },

  // Fulfillment Options
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

  // Summary
  summaryContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  savingsText: {
    color: "#27ae60",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  // Payment Button
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

  // Out of Stock
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
    lineHeight: 20,
  },
});