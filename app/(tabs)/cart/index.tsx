import React, { useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchCarts } from "./fetch-carts";
import { FetchCartType } from "./fetch-carts-type";
import useUserDetails from "../../../hook/useUserDetails";
import CartCard from "../../../components/Cart/CartCard";

// ✅ Import TanStack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
// ✅ Import Zustand store
import { useCartStore } from "../../../state/useCartStore";

function calculateTotals(cartData: FetchCartType[]) {
  const totalCarts = cartData.length;
  let totalItems = 0;
  for (const cart of cartData) {
    totalItems += cart.cartItemsCount;
  }
  return { totalCarts, totalItems };
}

const CartScreen = () => {
  const router = useRouter();
  const animation = useRef(null);
  const { userDetails, isLoading: isUserLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const queryClient = useQueryClient();
  const lastCartsData = useRef<string>('');

const {
  data: carts = [],
  isLoading,
  isFetching,
  refetch,
} = useQuery<FetchCartType[], Error>({
  queryKey: ["carts", authToken],
  queryFn: () => fetchCarts(authToken!),
  enabled: !!authToken,
  select: (fetchedCarts) =>
    fetchedCarts.map((cart) => ({
      ...cart,
      store: cart.store ?? {
        _id: cart.store_id,
        name: "Unknown Store",
        slug: "",
      },
    })),
});

// ✅ Sync TanStack Query data with Zustand store whenever carts data changes
useEffect(() => {
  if (carts && carts.length >= 0) {
    const cartsDataString = JSON.stringify(carts.map(c => ({ id: c._id, items: c.cart_items?.length || 0 })));
    
    // Only update if data actually changed
    if (cartsDataString !== lastCartsData.current) {
      lastCartsData.current = cartsDataString;
      
      // Transform the fetched carts to match Zustand store format
      const zustandCarts = carts.map(cart => ({
        store: { _id: cart.store._id },
        cart_items: cart.cart_items || []
      }));
      
      useCartStore.getState().setAllCarts(zustandCarts);
    }
  }
}, [carts]);

  // ✅ Whenever add/delete happens in CartCard
  // Call this from inside CartCard after mutation
  const refreshCarts = () => {
    queryClient.invalidateQueries({ queryKey: ["carts", authToken] });
  };

  if (isUserLoading || isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!carts || carts.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View style={styles.emptyHeader}>
          <Text style={styles.emptyHeaderText}>Cart</Text>
        </View>

        {/* Empty animation */}
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            loop
            ref={animation}
            style={{ width: widthPercentageToDP("60") }}
            source={require("../../../assets/lottiefiles/empty_cart_2.json")}
          />
        </View>

        {/* Empty text */}
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you have not added anything to your cart yet.
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/(tabs)/home/HomeScreen" })}
          style={styles.startShoppingButton}
        >
          <Text style={styles.startShoppingText}>Start Shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const { totalCarts, totalItems } = calculateTotals(carts);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.title}>
        <Ionicons name="arrow-back-outline" size={20} color="black" />
        <Text style={styles.titleText}>
          {carts.length > 1 ? "My Carts" : "My Cart"}
        </Text>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() =>
            router.push({ pathname: "/(tabs)/account/wishlist" })
          }
        >
          <Text style={styles.wishlistText}>Wishlist</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="cart" size={16} color="black" />
        <View style={styles.headerDetails}>
          <Text style={styles.totalHeaderText}>{totalItems} Items</Text>
          <Text style={styles.dot}>{" \u25CF"}</Text>
          <Text style={styles.totalHeaderText}>{totalCarts} Store(s)</Text>
        </View>
      </View>

      <FlashList
        data={[...carts].slice().reverse()}
        keyExtractor={(item) =>
          item._id || item.store._id || `cart-${Math.random()}`
        }
        estimatedItemSize={200}
        extraData={carts.length}
        contentContainerStyle={styles.listWrapper}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <CartCard
            id={item._id}
            store={item.store}
            items={item.cart_items || []}
            onCartChange={refreshCarts} // ✅ pass this down
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e9ecef" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: { fontSize: 20, fontWeight: "700", marginLeft: 10, flex: 1 },
  wishlistButton: { flexDirection: "column", alignItems: "center" },
  wishlistText: { color: "#f14343", fontSize: 14, fontWeight: "bold" },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "white",
    elevation: 2,
  },
  headerDetails: { flexDirection: "row", alignItems: "center", gap: 6 },
  totalHeaderText: { fontSize: 14 },
  dot: { color: "#848080", fontSize: 12 },
  listWrapper: { minHeight: 2, paddingVertical: 10 },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 30,
  },
  emptyHeader: {
    backgroundColor: "#fff",
    width: widthPercentageToDP(100),
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  emptyHeaderText: { fontSize: 30, fontWeight: "bold", color: "#000" },
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyTextContainer: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { color: "#292935", fontWeight: "600", fontSize: 20 },
  emptySubtitle: {
    color: "#707077",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 10,
  },
  startShoppingButton: {
    backgroundColor: "#f14343",
    width: widthPercentageToDP("90"),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  startShoppingText: { color: "#fff", fontWeight: "600", fontSize: 20 },
});

export default CartScreen;