import React, { useState, useCallback, useEffect } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useCheckoutStore } from "@/state/useCheckoutStore";
import { useCartStore } from "@/state/useCartStore";
import useUserDetails from "@/hook/useUserDetails";
import { getAsyncStorageItem } from "@/utility/asyncStorage";
import { CheckoutSections } from "./CheckoutSections";
import { CheckoutActions } from "./CheckoutAction";
import {
  processPayment,
  showPaymentSuccessAlert,
  showPaymentErrorAlert,
  getErrorMessage,
  validatePaymentPayload,
  InitCartPayload,
} from "./paymentUtils";
import { SelectData } from "./select/select-cart-type";
import { CartItemType, FetchCartStore, FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";

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
  
  // ✅ Local state for items with quantities
  const [localItems, setLocalItems] = useState(data.items);
  const [localSubTotal, setLocalSubTotal] = useState(data.sub_total);

  // Keep local state in sync when parent items change
  useEffect(() => {
    if (data.items?.length) {
      setLocalItems(data.items);
      // Recalculate sub_total
      const newSubTotal = data.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
      setLocalSubTotal(newSubTotal);
    }
  }, [data.items]);

  // ✅ Quantity change handler
  const handleQuantityChange = useCallback((itemId: string, newQty: number) => {
    if (newQty < 1) return; // Prevent negative quantities
    
    setLocalItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          const newTotalPrice = (item.unit_price || 0) * newQty;
          return { 
            ...item, 
            cart_qty: newQty, 
            total_price: newTotalPrice 
          };
        }
        return item;
      });
    });

    // Recalculate sub_total
    setLocalSubTotal(prevSubTotal => {
      const updatedItems = localItems.map(item => {
        if (item.id === itemId) {
          return { ...item, cart_qty: newQty, total_price: (item.unit_price || 0) * newQty };
        }
        return item;
      });
      return updatedItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    });
  }, [localItems]);

  // Validate and set default fulfillment option
  useEffect(() => {
    if (!selectedFulfillment && data.fulfillments?.length > 0) {
      setSelectedFulfillment(data.fulfillments[0].id);
    }
  }, [data.fulfillments, selectedFulfillment, setSelectedFulfillment]);

  const { fulfillments, breakups } = data;
  const selectedBreakup = breakups[selectedFulfillment] || Object.values(breakups)[0] || { 
    breakups: [], 
    total_savings: 0, 
    total: localSubTotal 
  };
  
  // ✅ Recalculate total based on updated sub_total
  const updatedSelectedBreakup = {
    ...selectedBreakup,
    total: selectedBreakup.total - data.sub_total + localSubTotal // Adjust total by difference
  };
  
  const selectedFulfillmentId = selectedFulfillment || fulfillments[0]?.id || "";
  const hasOutOfStockItems = localItems.some((item) => !item.instock);

  const validateFormData = useCallback((): { valid: boolean; error?: string } => {
    if (!userDetails?.accessToken) return { valid: false, error: "Please login to continue" };
    if (!selectedFulfillmentId) return { valid: false, error: "Please select a delivery option" };
    if (hasOutOfStockItems) return { valid: false, error: "Some items are out of stock. Please remove them to continue." };
    if (!data.address?.name || !data.address?.phone) return { valid: false, error: "Please add a complete delivery address" };
    if (updatedSelectedBreakup.total <= 0) return { valid: false, error: "Invalid order total" };
    return { valid: true };
  }, [userDetails, selectedFulfillmentId, hasOutOfStockItems, data.address, updatedSelectedBreakup.total]);

  const handlePayment = useCallback(async () => {
    const validation = validateFormData();
    if (!validation.valid) {
      showPaymentErrorAlert(validation.error!);
      return;
    }

    setPaymentLoading(true);

    try {
      const authToken = await getAsyncStorageItem("auth-token");
      if (!authToken) throw new Error("Please login to continue");

      const referralId = await getAsyncStorageItem("referralId").catch(() => null);

      const payload: InitCartPayload = {
        address: { ...data.address, gps: data.address.gps || { lat: 0, lon: 0 } },
        onselect_msgId: data.context.message_id,
        storeId: cart.store._id,
        addressId: data.addressId,
        selected_fulfillmentId: selectedFulfillmentId,
        ...(appliedOfferId && { offerId: appliedOfferId }),
        ...(referralId && { referrer_id: referralId }),
      };

      const payloadValidation = validatePaymentPayload(payload);
      if (!payloadValidation.valid) throw new Error(payloadValidation.errors.join(", "));

      const paymentResult = await processPayment({
        payload,
        authToken,
        storeName: cart.store.name,
        userDetails: {
          firstName: userDetails!.firstName,
          lastName: userDetails!.lastName,
          email: userDetails!.email,
          phoneNumber: userDetails!.phoneNumber,
        },
      });

      if (paymentResult.success && paymentResult.orderId) {
        setOpen(false);
        await removeCart(cart.store._id, authToken);
        showPaymentSuccessAlert(paymentResult.orderId);
        setRetryCount(0);
      } else {
        throw new Error(paymentResult.error || "Payment failed");
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      console.error("Payment error:", errorMessage);

      showPaymentErrorAlert(
        errorMessage,
        cart.store._id,
        retryCount < 2 ? () => { setRetryCount(prev => prev + 1); handlePayment(); } : undefined
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

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <CheckoutSections
        data={data}
        cart={cart}
        store={store}
        items={localItems} // ✅ Use local items with updated quantities
        fulfillments={fulfillments}
        selectedFulfillmentId={selectedFulfillmentId}
        selectedBreakup={updatedSelectedBreakup} // ✅ Use updated breakup with new totals
        hasOutOfStockItems={hasOutOfStockItems}
        onFulfillmentSelect={setSelectedFulfillment}
        onBreakupPress={handleBreakupPress}
        onQuantityChange={handleQuantityChange} // ✅ Pass quantity change handler
        subTotal={localSubTotal} // ✅ Use updated sub total
      />

      <CheckoutActions
        hasOutOfStockItems={hasOutOfStockItems}
        selectedFulfillmentId={selectedFulfillmentId}
        paymentLoading={paymentLoading}
        totalAmount={updatedSelectedBreakup.total} // ✅ Use updated total
        onPayment={handlePayment}
      />
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
});
