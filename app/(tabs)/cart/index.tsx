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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../../../state/useCartStore";

const CartScreen = () => {
  const router = useRouter();
  const animation = useRef<LottieView>(null);
  const { userDetails, isLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const queryClient = useQueryClient();
  const lastCartsData = useRef<string>("");

  // Get carts from Zustand store
  const { allCarts } = useCartStore();

  const {
    data: apiCarts = [],
    isLoading: isCartsLoading,
    isFetching,
    refetch,
    error,
  } = useQuery<FetchCartType[], Error>({
    queryKey: ["carts", authToken],
    queryFn: () => fetchCarts(authToken!),
    enabled: !!authToken,
    select: (fetchedCarts) => {
      // Ensure we return properly formatted data
      if (!Array.isArray(fetchedCarts)) return [];
      
      return fetchedCarts
        .filter(cart => cart && (cart.cart_items?.length > 0 || cart.cartItemsCount > 0))
        .map((cart) => ({
          ...cart,
          store: cart.store ?? {
            _id: cart.store_id || cart._id,
            name: cart.store?.name || "Unknown Store",
            slug: cart.store?.slug || "",
          },
        }));
    },
  });

  // ✅ Sync TanStack Query data with Zustand
  useEffect(() => {
    if (!apiCarts || !Array.isArray(apiCarts)) return;
    
    const cartsDataString = JSON.stringify(
      apiCarts.map((c) => ({ 
        id: c._id, 
        items: c.cart_items?.length || c.cartItemsCount || 0 
      }))
    );

    if (cartsDataString !== lastCartsData.current) {
      lastCartsData.current = cartsDataString;
      // Set all carts to Zustand store
      useCartStore.getState().setAllCarts(apiCarts);
    }
  }, [apiCarts]);

  // ✅ Refresh carts from children (CartCard)
  const refreshCarts = () => {
    queryClient.invalidateQueries({ queryKey: ["carts", authToken] });
  };

  // Calculate totals from Zustand store (actual cart items)
  const calculateTotals = () => {
    if (!Array.isArray(allCarts) || allCarts.length === 0) {
      return { totalCarts: 0, totalItems: 0 };
    }

    const validCarts = allCarts.filter(cart => 
      cart && cart.cart_items && cart.cart_items.length > 0
    );

    const totalCarts = validCarts.length;
    let totalItems = 0;
    
    for (const cart of validCarts) {
      if (cart.cart_items && Array.isArray(cart.cart_items)) {
        // Sum up quantities for accurate item count
        totalItems += cart.cart_items.reduce((sum, item) => sum + (item.qty || 1), 0);
      }
    }
    
    return { totalCarts, totalItems };
  };

  if (isLoading || isCartsLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        <View style={styles.emptyHeader}>
          <Text style={styles.emptyHeaderText}>Cart</Text>
        </View>
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyTitle}>Unable to load cart</Text>
          <Text style={styles.emptySubtitle}>Please try again</Text>
        </View>
        <TouchableOpacity
          onPress={refetch}
          style={styles.startShoppingButton}
        >
          <Text style={styles.startShoppingText}>Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Use apiCarts for rendering (has all the store info) but Zustand for counts
  const validCarts = Array.isArray(apiCarts) ? apiCarts.filter(cart => 
    cart && (cart.cart_items?.length > 0 || cart.cartItemsCount > 0)
  ) : [];

  if (validCarts.length === 0) {
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

        {/* Empty text */}
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you have not added anything to your cart yet.
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home/HomeScreen")}
          style={styles.startShoppingButton}
        >
          <Text style={styles.startShoppingText}>Start Shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const { totalCarts, totalItems } = calculateTotals();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.title}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.titleText}>
          {validCarts.length > 1 ? "My Carts" : "My Cart"}
        </Text>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => router.push("/(tabs)/account/wishlist")}
        >
          <Text style={styles.wishlistText}>Wishlist</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-header with correct counts from Zustand store */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="cart" size={16} color="black" />
        <View style={styles.headerDetails}>
          <Text style={styles.totalHeaderText}>
            {totalItems} Item{totalItems !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.dot}>{" \u25CF"}</Text>
          <Text style={styles.totalHeaderText}>
            {totalCarts} Store{totalCarts !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <FlashList
        data={validCarts.slice().reverse()}
        keyExtractor={(item, index) =>
          item._id || item.store?._id || `cart-${index}`
        }
        estimatedItemSize={200}
        extraData={[validCarts.length, totalItems, totalCarts]} // Add dependency for re-renders
        contentContainerStyle={styles.listWrapper}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <CartCard
            id={item._id}
            store={item.store}
            items={item.cart_items || []}
            onCartChange={refreshCarts}
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