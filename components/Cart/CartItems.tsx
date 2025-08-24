import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import ChangeQtyButton from "./ChangeQtyButton";

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId?: string;
  items: CartItemType[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartId, items }) => {
  const { userDetails, isLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  const [localItems, setLocalItems] = useState<CartItemType[]>(items);

  useEffect(() => setLocalItems(items), [items]);

  const formatCurrency = (amt: number) =>
    `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;

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

        {/* ✅ Replaced inline + / - with reusable ChangeQtyButton */}
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
          onQtyChange={(newQty: any) => {
            setLocalItems((prev) =>
              prev.map((i) =>
                i._id === item._id
                  ? {
                      ...i,
                      qty: newQty,
                      total_price: (i.unit_price || 0) * newQty,
                    }
                  : i
              )
            );
          }}
        />
      </TouchableOpacity>
    );
  };

  const { totalCost, totalItems } = useMemo(() => {
    return localItems.reduce(
      (acc, i) => {
        acc.totalCost += i.total_price || i.unit_price * i.qty;
        acc.totalItems += i.qty;
        return acc;
      },
      { totalCost: 0, totalItems: 0 }
    );
  }, [localItems]);

  if (isLoading)
    return (
      <ActivityIndicator
        style={{ marginTop: 50 }}
        size="large"
        color="#2f9740"
      />
    );

  if (!localItems.length) {
    return (
      <View style={styles.center}>
        <Text>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Items ({localItems.length}, {totalItems} total)
      </Text>
      <FlashList
        data={localItems}
        renderItem={renderCartItem}
        keyExtractor={(i) => i._id}
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
    </ScrollView>
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
