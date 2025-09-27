import { FlashList } from "@shopify/flash-list";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import Loader from "../common/Loader";
import CartItemRenderer from "./CartItemRenderer";
import CartCheckoutButton from "./CartCheckoutButton";
import { useCartStore } from "../../state/useCartStore";

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId: string;
  isStoreOpen?: boolean;
  onCartChange?: () => void;
  onItemChange?: (itemId: string, newQty: number) => void;
}

const CartItems: React.FC<CartItemsProps> = ({
  cartId,
  storeId,
  storeSlug,
  isStoreOpen = true,
  onCartChange,
  onItemChange,
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>
          Items ({items.length}, {totalItems} total)
        </Text>
      </View>

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

      {/* Checkout Button */}
      <CartCheckoutButton
        cartId={cartId}
        storeId={storeId}
        items={availableItems} // Only pass available items for checkout
        isStoreOpen={isStoreOpen}
      />
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
    paddingHorizontal: 20,
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A202C",
  },
  headerSubtext: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 8,
  },
});

export default CartItems;
