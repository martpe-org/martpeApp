import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
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
  processPayment,
  showPaymentSuccessAlert,
  showPaymentErrorAlert,
  getErrorMessage,
  validatePaymentPayload,
  InitCartPayload,
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
  const [retryCount, setRetryCount] = useState(0);

  // Validate and set default fulfillment option
  useEffect(() => {
    if (!selectedFulfillment && data.fulfillments?.length > 0) {
      setSelectedFulfillment(data.fulfillments[0].id);
    }
  }, [data.fulfillments, selectedFulfillment, setSelectedFulfillment]);

  const { items, fulfillments, breakups, sub_total } = data;
  const selectedBreakup = breakups[selectedFulfillment] || Object.values(breakups)[0] || { 
    breakups: [], 
    total_savings: 0, 
    total: sub_total 
  };
  const selectedFulfillmentId = selectedFulfillment || fulfillments[0]?.id || "";

  const hasOutOfStockItems = items.some((item) => !item.instock);

  const handleBreakupPress = useCallback((breakup: any) => {
    if (breakup.children && breakup.children.length > 0) {
      const details = breakup.children
        .map((child: any) => `${child.custom_title || child.title}: ₹${child.price}`)
        .join('\n');
      
      Alert.alert(
        breakup.custom_title || breakup.title,
        details,
        [{ text: "OK", style: "default" }]
      );
    }
  }, []);

  const validateFormData = useCallback((): { valid: boolean; error?: string } => {
    if (!userDetails?.accessToken) {
      return { valid: false, error: "Please login to continue" };
    }

    if (!selectedFulfillmentId) {
      return { valid: false, error: "Please select a delivery option" };
    }

    if (hasOutOfStockItems) {
      return { valid: false, error: "Some items are out of stock. Please remove them to continue." };
    }

    if (!data.address || !data.address.name || !data.address.phone) {
      return { valid: false, error: "Please add a complete delivery address" };
    }

    if (selectedBreakup.total <= 0) {
      return { valid: false, error: "Invalid order total" };
    }

    return { valid: true };
  }, [userDetails, selectedFulfillmentId, hasOutOfStockItems, data.address, selectedBreakup.total]);

  const handlePayment = useCallback(async () => {
    // Validate form data
    const validation = validateFormData();
    if (!validation.valid) {
      showPaymentErrorAlert(validation.error!);
      return;
    }

    setPaymentLoading(true);

    try {
      // Prepare payment payload
      const payload: InitCartPayload = {
        address: {
          name: data.address.name,
          houseNo: data.address.houseNo,
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          pincode: data.address.pincode,
          phone: data.address.phone,
        },
        onselect_msgId: data.context.message_id,
        storeId: cart.store._id,
        addressId: data.addressId,
        selected_fulfillmentId: selectedFulfillmentId,
        ...(appliedOfferId ? { offerId: appliedOfferId } : {}),
      };

      // Validate payload
      const payloadValidation = validatePaymentPayload(payload);
      if (!payloadValidation.valid) {
        throw new Error(payloadValidation.errors.join(', '));
      }

      // Process payment
      const paymentResult = await processPayment({
        payload,
        authToken: userDetails!.accessToken!,
        storeName: cart.store.name,
        userDetails: {
          firstName: userDetails!.firstName,
          lastName: userDetails!.lastName,
          email: userDetails!.email,
          phoneNumber: userDetails!.phoneNumber,
        },
      });

      if (paymentResult.success && paymentResult.orderId) {
        // Success - clean up and navigate
        setOpen(false);
        await removeCart(cart.store._id, userDetails!.accessToken!);
        showPaymentSuccessAlert(paymentResult.orderId);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(paymentResult.error || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage = getErrorMessage(error);
      
      // Show error with retry option if not too many retries
      showPaymentErrorAlert(
        errorMessage,
        cart.store._id,
        retryCount < 2 ? () => {
          setRetryCount(prev => prev + 1);
          handlePayment();
        } : undefined
      );
    } finally {
      setPaymentLoading(false);
    }
  }, [
    validateFormData,
    data,
    cart.store,
    selectedFulfillmentId,
    appliedOfferId,
    userDetails,
    removeCart,
    setOpen,
    retryCount
  ]);

  const renderStoreSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Store Details</Text>
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => {
          const slug = store?.slug || cart?.store?.slug;
          if (slug) {
            router.push(`/(tabs)/home/result/productListing/${slug}`);
          }
        }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: cart.store.symbol }}
          style={styles.storeImage}
          resizeMode="cover"
        />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{cart.store.name}</Text>
          <Text style={styles.storeAddress} numberOfLines={2}>
            {cart.store.address.street}, {cart.store.address.city}
          </Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
      </TouchableOpacity>
    </View>
  );

  const renderAddressSection = () => (
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
        <Text style={styles.addressPhone}>📞 {data.address.phone}</Text>
      </View>
    </View>
  );

  const renderItemsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
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
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.product.symbol }}
              style={styles.itemImage}
              resizeMode="cover"
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
              {item.product.variant_info && (
                <Text style={styles.variantText}>{item.product.variant_info}</Text>
              )}
              {item.selected_customizations && item.selected_customizations.length > 0 && (
                <Text style={styles.customizationsText}>
                  Customizations: {item.selected_customizations.map(c => c.name).join(", ")}
                </Text>
              )}
            </View>
            <View style={styles.itemPriceContainer}>
              <Text style={styles.itemPrice}>₹{item.total_price}</Text>
              {!item.instock && (
                <MaterialIcons name="error" size={20} color="#e74c3c" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFulfillmentSection = () => (
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
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.radio,
                selectedFulfillmentId === fulfillment.id &&
                  styles.radioSelected,
              ]}
            >
              {selectedFulfillmentId === fulfillment.id && (
                <View style={styles.radioInner} />
              )}
            </View>
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
  );

  const renderOutOfStockSection = () => (
    hasOutOfStockItems && (
      <View style={styles.outOfStockSection}>
        <MaterialIcons name="warning" size={24} color="#f39c12" />
        <View style={styles.outOfStockContent}>
          <Text style={styles.outOfStockTitle}>Items Unavailable</Text>
          <Text style={styles.outOfStockMessage}>
            Some items in your cart are out of stock. Please remove them to continue with your order.
          </Text>
        </View>
      </View>
    )
  );

  const renderPaymentButton = () => (
    !hasOutOfStockItems && (
      <View style={styles.paymentSection}>
        <TouchableOpacity
          style={[
            styles.paymentBtn,
            (!selectedFulfillmentId || paymentLoading) &&
              styles.paymentBtnDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedFulfillmentId || paymentLoading}
          activeOpacity={0.8}
        >
          {paymentLoading ? (
            <View style={styles.loadingContainer}>
              <Loader />
              <Text style={styles.paymentBtnText}>Processing Payment...</Text>
            </View>
          ) : (
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentBtnText}>
                Pay ₹{selectedBreakup.total}
              </Text>
              <MaterialIcons name="lock" size={20} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>🔒 Secure payment powered by Razorpay</Text>
      </View>
    )
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderStoreSection()}
      {renderAddressSection()}
      {renderItemsSection()}
      {renderFulfillmentSection()}

      {/* Bill Summary */}
      <View style={styles.section}>
        <BillSummary
          subTotal={sub_total}
          breakups={selectedBreakup.breakups}
          totalSavings={selectedBreakup.total_savings}
          grandTotal={selectedBreakup.total}
          onBreakupPress={handleBreakupPress}
        />
      </View>

      {/* Cancellation Policy */}
      <View style={styles.section}>
        <CancellationPolicy isCancellable />
      </View>

      {renderOutOfStockSection()}
      {renderPaymentButton()}
    </ScrollView>
  );
};

export default CheckoutContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
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
    backgroundColor: "white",
  },
  editText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  storeCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 8,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "flex-start",
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
  variantText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 2,
  },
  customizationsText: {
    fontSize: 12,
    color: "#666",
  },
  outOfStock: {
    color: "#e74c3c",
    fontWeight: "500",
  },
  itemPriceContainer: {
    alignItems: "flex-end",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
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
    borderWidth: 2,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFulfillment: {
    borderColor: "#00BC66",
    backgroundColor: "#f0fdf4",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#00BC66",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    alignItems: "center",
  },
  paymentBtn: {
    backgroundColor: "#00BC66",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "#00BC66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    width: "100%",
    maxWidth: 400,
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
    gap: 12,
  },
  paymentBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  secureText: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  outOfStockSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff3cd",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  outOfStockContent: {
    flex: 1,
  },
  outOfStockTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 4,
  },
  outOfStockMessage: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },
});