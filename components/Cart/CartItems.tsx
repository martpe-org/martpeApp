import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import ChangeQtyButton from "./ChangeQtyButton";

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId?: string;
  items: CartItemType[];
}

// Mock API function - replace with your actual API call
const fetchCartItems = async (cartId: string): Promise<CartItemType[]> => {
  // Replace this with your actual API endpoint
  const response = await fetch(`/api/carts/${cartId}/items`);
  if (!response.ok) {
    throw new Error('Failed to fetch cart items');
  }
  return response.json();
};

const CartItems: React.FC<CartItemsProps> = ({ cartId, items }) => {
  const { isLoading: userLoading } = useUserDetails();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Use TanStack Query to manage cart items
  const {
    data: cartItems,
    isLoading: cartLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cartItems', cartId],
    queryFn: () => fetchCartItems(cartId),
    initialData: items, // Use passed items as initial data
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const formatCurrency = (amt: number) =>
    `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;

  const handleQtyChange = (itemId: string, newQty: number, unitPrice: number) => {
    // Optimistically update the cache
    queryClient.setQueryData(['cartItems', cartId], (oldData: CartItemType[] | undefined) => {
      if (!oldData) return oldData;
      
      return oldData.map((item) =>
        item._id === itemId
          ? {
              ...item,
              qty: newQty,
              total_price: unitPrice * newQty,
            }
          : item
      );
    });
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.item}
        key={item._id}
        onPress={() => {
          if (item.product?.slug) {
            router.push(
              `/(tabs)/home/result/productDetails/${item.product.slug}`
            );
          } else {
            toast.show("Product details not available", { type: "warning" });
          }
        }}
      >
        <Image source={{ uri: item.product?.symbol }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.product?.name}</Text>
          <Text style={styles.price}>{formatCurrency(item.unit_price)}</Text>
          <Text style={styles.total}>
            {formatCurrency(item.total_price || item.unit_price * item.qty)}
          </Text>
        </View>

        <ChangeQtyButton
          cartItemId={item._id}
          qty={item.qty}
          max={item.product?.quantity}
          instock={item.product?.instock}
          customizable={item.product?.customizable}
          productName={item.product?.name}
          storeId={item.store_id}
          customGroupIds={item.product?.directlyLinkedCustomGroupIds ?? []}
          productPrice={item.unit_price}
          onQtyChange={(newQty: number) => {
            handleQtyChange(item._id, newQty, item.unit_price);
          }}
        />
      </TouchableOpacity>
    );
  };

  const { totalCost, totalItems } = useMemo(() => {
    if (!cartItems) return { totalCost: 0, totalItems: 0 };
    
    return cartItems.reduce(
      (acc, item) => {
        acc.totalCost += item.total_price || item.unit_price * item.qty;
        acc.totalItems += item.qty;
        return acc;
      },
      { totalCost: 0, totalItems: 0 }
    );
  }, [cartItems]);

  if (userLoading || cartLoading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 50 }}
        size="large"
        color="#2f9740"
      />
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error loading cart items</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: "#2f9740", marginTop: 8 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cartItems?.length) {
    return (
      <View style={styles.center}>
        <Text>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Items ({cartItems.length}, {totalItems} total)
      </Text>
      <FlashList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        estimatedItemSize={80}
      />
      <View style={styles.footer}>
        <Text style={styles.subtotal}>
          Subtotal: {formatCurrency(totalCost)}
        </Text>
        <TouchableOpacity
          style={styles.checkout}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/cart/[checkout]",
              params: { checkout: cartId },
            })
          }
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { fontSize: 16, fontWeight: "bold", margin: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  name: { fontWeight: "600" },
  price: { color: "#666", fontSize: 12 },
  total: { fontWeight: "700", marginTop: 4 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  subtotal: { fontWeight: "bold", marginBottom: 12 },
  checkout: {
    backgroundColor: "#f14343",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "700" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
});

export default CartItems;
