import { FlashList } from "@shopify/flash-list";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import Loader from "../common/Loader";
import CartItemRenderer from "./CartItemRenderer";
import CartCheckoutButton from "./CartCheckoutButton";
import { useCartStore } from "../../state/useCartStore";
import CartTotals from "./CartTotals";

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId: string;
  isStoreOpen?: boolean;
  onCartChange?: () => void;
  onItemChange?: (itemId: string, newQty: number) => void;
  cartSubtotal: number;
  discount: number;
  cartTotal: number;
  appliedOfferId?: string;
}

const CartItems: React.FC<CartItemsProps> = ({
  cartId,
  storeId,
  storeSlug,
  isStoreOpen = true,
  onCartChange,
  onItemChange,
  cartSubtotal,
  discount,
  cartTotal,
  appliedOfferId,
}) => {

  const { isLoading: userLoading } = useUserDetails();

  // 🔑 Directly pull items from Zustand
  const cart = useCartStore((state) => state.getCartByStoreId(storeId));
  const items = cart?.cart_items || [];

  const handleQtyChange = (itemId: string, newQty: number) => {
    // Notify parent components if needed
    onCartChange?.();
    onItemChange?.(itemId, newQty);
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => (
    <CartItemRenderer item={item} onQtyChange={handleQtyChange} />
  );

  // Calculate totals from Zustand state
  const { totalItems, totalCost } = useMemo(() => {
    if (!items?.length) return { totalCost: 0, totalItems: 0 };

    return items.reduce(
      (acc, item) => {
        const qty = item.qty || 1;
        const itemTotal = item.total_price || (item.unit_price || 0) * qty;
        acc.totalCost += itemTotal;
        acc.totalItems += qty;
        return acc;
      },
      { totalCost: 0, totalItems: 0 }
    );
  }, [items]);

  // Only show available items for checkout
  const availableItems = useMemo(
    () => items.filter((item) => item.product?.instock),
    [items]
  );

  if (userLoading) {
    return (
      <View style={styles.center}>
        <Loader />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!items?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubText}>Add items to get started</Text>
      </View>
    );
  }
return (
<View style={styles.container}>
  {/* Items List */}
  <FlashList
    data={items}
    renderItem={renderCartItem}
    keyExtractor={(item) => item._id || `item-${Math.random()}`}
    estimatedItemSize={120}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.listContainer}
    extraData={[items.length, totalItems, totalCost]}
  />

  {/* Footer */}
  <View style={styles.footerContainer}>
    {/* Show totals only if available items exist */}
    {availableItems.length > 0 && (
      <CartTotals
        subtotal={cartSubtotal}
        discount={discount}
        total={cartTotal}
        appliedOfferId={appliedOfferId}
      />
    )}

    {/* Checkout button always visible */}
    <CartCheckoutButton
      cartId={cartId}
      storeId={storeId}
      items={availableItems} // Only pass available items for checkout
      isStoreOpen={isStoreOpen}
    />
  </View>
</View>

);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 0, // Ensure no padding at bottom of list
  },
  footerContainer: {
    // Remove any gaps between totals and checkout button
    gap: 0,
    marginTop: 0,
    paddingTop: 0,
  },
});

export default CartItems;