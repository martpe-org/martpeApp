import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import CartCard from "../../../components/Cart/CartCard";
import { FlashList } from "@shopify/flash-list";
import { BackArrow } from "../../../constants/icons/commonIcons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchCarts } from "./fetch-carts";
import { FetchCartType } from "./fetch-carts-type";
import useUserDetails from "../../../hook/useUserDetails";

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
  const [carts, setCarts] = useState<FetchCartType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userDetails, isLoading: isUserLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const loadCarts = async () => {
    if (!authToken) {
      setCarts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedCarts = await fetchCarts(authToken);

      if (!fetchedCarts) {
        setCarts([]);
        return;
      }

      // Ensure every cart has a store object
      const cartsWithStores = fetchedCarts.map((cart) => ({
        ...cart,
        store:
          cart.store ??
          {
            _id: cart.store_id,
            name: "Unknown Store",
            slug: "",
          },
      }));

      setCarts(cartsWithStores);
    } catch (error) {
      console.error("Failed to fetch carts:", error);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCarts();
    setRefreshing(false);
  }, [authToken]);

  useEffect(() => {
    if (!isUserLoading) {
      loadCarts();
    }
  }, [authToken, isUserLoading]);

  if (isUserLoading || loading) {
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.title}>
        <BackArrow onPress={() => router.back()} />
        <Text style={styles.titleText}>
          {carts.length > 1 ? "My Carts" : "My Cart"}
        </Text>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() =>
            router.push({ pathname: "/(tabs)/account/wishlist" })
          }
        >
          <MaterialCommunityIcons name="heart" size={24} color="#f14343" />
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
        keyExtractor={(item) => item._id || item.store._id || `cart-${Math.random()}`}
        estimatedItemSize={200}
        extraData={carts.length}
        contentContainerStyle={styles.listWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <CartCard
            id={item._id}
            store={item.store}
            items={item.cart_items || []}
          />
        )}
      />
    </View>
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
    marginTop: 20,
  },
  titleText: { fontSize: 20, fontWeight: "700", marginLeft: 10, flex: 1 },
  wishlistButton: { flexDirection: "column", alignItems: "center" },
  wishlistText: { color: "#f14343", fontSize: 12, fontWeight: "500" },
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
  animationContainer: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center", flex: 1 },
  emptyTextContainer: { height: 100, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#292935", fontWeight: "600", fontSize: 20 },
  emptySubtitle: { color: "#707077", fontWeight: "600", fontSize: 13, marginTop: 10 },
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
