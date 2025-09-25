import { FlashList } from "@shopify/flash-list";
import React, { useMemo, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import Loader from "../common/Loader";
import CartItemRenderer from "./CartItemRenderer";
import CartCheckoutButton from "./CartCheckoutButton";

// ✅ Safe number conversion helper
const toNumber = (v: any): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = Number(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (v && typeof v === "object") {
    if ("value" in v) return toNumber((v as any).value);
    if ("amount" in v) return toNumber((v as any).amount);
  }
  return 0;
};

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId: string;
  items: CartItemType[];
  isStoreOpen?: boolean;
  onCartChange?: () => void;
}

const CartItems: React.FC<CartItemsProps> = ({
  cartId,
  storeId,
  storeSlug,
  items,
  isStoreOpen = true,
  onCartChange,
}) => {
  const { isLoading: userLoading } = useUserDetails();
  const [localItems, setLocalItems] = useState<CartItemType[]>([]);

  // Keep local state in sync when parent items change
  useEffect(() => {
    if (items?.length) {
      setLocalItems(items);
    }
  }, [items]);

  const handleQtyChange = (itemId: string, newQty: number) => {
    // Optimistic local state update
    setLocalItems((prev) =>
      prev.map((p) =>
        p._id === itemId
          ? {
              ...p,
              qty: newQty,
              total_price:
                toNumber(p.unit_price ?? p.product?.price) * newQty,
            }
          : p
      )
    );
    onCartChange?.();
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => (
    <CartItemRenderer item={item} onQtyChange={handleQtyChange} />
  );

  // ✅ Calculate totals safely, using total_price if available
  const { totalCost, totalItems } = useMemo(() => {
    if (!localItems?.length) return { totalCost: 0, totalItems: 0 };

    return localItems.reduce(
      (acc, item) => {
        const qty = Math.max(1, toNumber(item.qty));
        const unitPrice = toNumber(
          item.total_price !== undefined ? item.total_price / qty : item.unit_price ?? item.product?.price
        );
        const itemTotal = unitPrice * qty;
        acc.totalCost += itemTotal;
        acc.totalItems += qty;
        return acc;
      },
      { totalCost: 0, totalItems: 0 }
    );
  }, [localItems]);

  if (userLoading) {
    return (
      <View style={styles.center}>
        <Loader />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!localItems?.length) {
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
      <Text style={styles.header}>
        Items ({localItems.length}, {totalItems} total)
      </Text>

      {/* Items List */}
      <FlashList
        data={localItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id || `item-${Math.random()}`}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Checkout Button */}
      <CartCheckoutButton
        cartId={cartId}
        storeId={storeId}
        items={localItems} // 🔄 pass ALL items
        isStoreOpen={isStoreOpen}
        cartTotal={totalCost} // pass the updated total
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
  header: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 16,
    color: "#1A202C",
  },
  listContainer: {
    paddingHorizontal: 8,
  },
});

export default CartItems;
