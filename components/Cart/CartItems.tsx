import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import useUserDetails from "../../hook/useUserDetails";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import { useToast } from "react-native-toast-notifications";

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId?: string;
  items: CartItemType[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartId, storeSlug, storeId, items }) => {
  const { removeCartItems, removeCart, updateQty } = useCartStore();
  const { userDetails, isLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  const [localItems, setLocalItems] = useState<CartItemType[]>(items);
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  useEffect(() => setLocalItems(items), [items]);

  const formatCurrency = (amt: number) => `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;

  const updateLocalQuantity = (id: string, qty: number) => {
    setLocalItems(prev =>
      prev.map(i => (i._id === id ? { ...i, qty, total_price: (i.unit_price || 0) * qty } : i))
    );
  };

  const removeLocalItem = (id: string) => setLocalItems(prev => prev.filter(i => i._id !== id));

  const handleQuantityChange = async (id: string, qty: number, oldQty: number) => {
    if (!authToken || qty < 0 || qty === oldQty) return;

    updateLocalQuantity(id, qty);
    setProcessing(p => new Set(p).add(id));

    try {
      const success = await updateQty(id, qty, authToken);
      if (!success) updateLocalQuantity(id, oldQty);
    } catch {
      updateLocalQuantity(id, oldQty);
      toast.show("Failed to update quantity", { type: "error" });
    } finally {
      setProcessing(p => {
        const s = new Set(p);
        s.delete(id);
        return s;
      });
    }
  };

  const increment = (id: string, qty: number, max?: number) => {
    if (max && qty >= max) return toast.show("Max quantity reached", { type: "warning" });
    handleQuantityChange(id, qty + 1, qty);
  };

  const decrement = (id: string, qty: number) => {
    if (qty > 1) handleQuantityChange(id, qty - 1, qty);
    else handleDeleteItem(id);
  };

  const handleDeleteItem = (id: string) => {
    if (!authToken) return;

    Alert.alert("Remove Item", "Do you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          removeLocalItem(id);
          setProcessing(p => new Set(p).add(id));
          try {
            const success =
              localItems.length === 1
                ? await removeCart(storeId || storeSlug, authToken)
                : await removeCartItems([id], authToken);
            if (!success) setLocalItems(items);
          } catch {
            setLocalItems(items);
          } finally {
            setProcessing(p => {
              const s = new Set(p);
              s.delete(id);
              return s;
            });
          }
        },
      },
    ]);
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
      <View style={styles.qtyBox}>
        <TouchableOpacity onPress={() => decrement(item._id, item.qty)}>
          <Text style={styles.sign}>-</Text>
        </TouchableOpacity>
        <Text>{item.qty}</Text>
        <TouchableOpacity
          onPress={() =>
            increment(item._id, item.qty, item.product?.quantity)
          }
        >
          <Text style={styles.sign}>+</Text>
        </TouchableOpacity>
      </View>
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

  if (isLoading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#2f9740" />;

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
      <FlashList data={localItems} renderItem={renderCartItem} keyExtractor={i => i._id} estimatedItemSize={80} />
      <View style={styles.footer}>
        <Text style={styles.subtotal}>Subtotal: {formatCurrency(totalCost)}</Text>
        <TouchableOpacity
          style={styles.checkout}
          onPress={() =>
            authToken &&
            router.push({ pathname: "./cart/[checkout]", params: { id: cartId } })
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
  item: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  image: { width: 50, height: 50, borderRadius: 6, marginRight: 12, backgroundColor: "#f0f0f0" },
  name: { fontWeight: "600" },
  price: { color: "#666", fontSize: 12 },
  total: { fontWeight: "700", marginTop: 4 },
  qtyBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 4 },
  sign: { fontSize: 18, paddingHorizontal: 6 },
  footer: { padding: 16, borderTopWidth: 1, borderColor: "#eee" },
  subtotal: { fontWeight: "bold", marginBottom: 12 },
  checkout: { backgroundColor: "#f14343", padding: 12, borderRadius: 8, alignItems: "center" },
  checkoutText: { color: "#fff", fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
});

export default CartItems;
