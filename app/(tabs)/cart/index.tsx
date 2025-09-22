import React from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import useUserDetails from "../../../hook/useUserDetails";
import { useCartStore } from "../../../state/useCartStore";
import CartCard from "../../../components/Cart/CartCard";
import CartHeader from "../../../components/Cart/CartHeader";
import { useCartsQuery } from "@/hook/useCartsQuery";

const CartScreen = () => {
  const { userDetails, isLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const { data: apiCarts = [], isLoading: isCartsLoading, isFetching, refetch, error, refreshCarts } =
    useCartsQuery(authToken);
  const { allCarts } = useCartStore();

  const calculateTotals = () => {
    if (!allCarts?.length) return { totalCarts: 0, totalItems: 0 };
    const validCarts = allCarts.filter(c => c?.cart_items?.length > 0);
    const totalCarts = validCarts.length;
    const totalItems = validCarts.reduce(
      (sum, cart) => sum + cart.cart_items.reduce((s, i) => s + (i.qty || 1), 0),
      0
    );
    return { totalCarts, totalItems };
  };

  if (isLoading || isCartsLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <Text style={styles.emptyTitle}>Unable to load cart</Text>
        <Text style={styles.emptySubtitle}>Please try again</Text>
      </ScrollView>
    );
  }

  const validCarts = apiCarts.filter(c => c?.cart_items?.length > 0 || c.cartItemsCount > 0);
  if (!validCarts.length) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
        <Text style={styles.emptySubtitle}>Looks like you haven’t added anything yet.</Text>
      </ScrollView>
    );
  }

  const { totalCarts, totalItems } = calculateTotals();

  return (
    <SafeAreaView style={styles.container}>
      <CartHeader totalItems={totalItems} totalCarts={totalCarts} multipleCarts={validCarts.length > 1} />
      <FlashList
        data={validCarts.slice().reverse()}
        keyExtractor={(item, i) => item._id || item.store?._id || `cart-${i}`}
        estimatedItemSize={200}
        extraData={[validCarts.length, totalItems, totalCarts]}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <CartCard id={item._id} store={item.store} items={item.cart_items || []} onCartChange={refreshCarts} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e9ecef" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#292935" },
  emptySubtitle: { fontSize: 13, color: "#707077", marginTop: 10 },
});

export default CartScreen;
