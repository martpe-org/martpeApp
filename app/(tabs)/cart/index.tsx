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
      console.log("No auth token available");
      setCarts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedCarts = await fetchCarts(authToken);
      setCarts(fetchedCarts || []);
    } catch (error) {
      console.error("Error fetching carts:", error);
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
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            ref={animation}
            style={{
              width: widthPercentageToDP("60"),
              backgroundColor: "#fff",
            }}
            source={require("../../../assets/lottiefiles/empty_cart_2.json")}
          />
        </View>
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you have not added anything to your cart yet.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "../(tabs)/home" })}
          style={styles.startShoppingButton}
        >
          <Text style={styles.startShoppingText}>Start Shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const { totalCarts, totalItems } = calculateTotals(carts);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.title}>
        <BackArrow onPress={() => router.back()} />

        {/* Center Title */}
        <Text style={styles.titleText}>
          {carts.length > 1 ? "My Carts" : "My Cart"}
        </Text>

        {/* Heart icon aligned extreme right */}
        <TouchableOpacity style={{ marginLeft: "auto" }} onPress={() => router.push({ pathname: "../(tabs)/account/wishlist" }  )}>
          <MaterialCommunityIcons name="heart" size={24} color="#f14343" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <MaterialCommunityIcons name="cart" size={16} color="black" />
        <View style={styles.headerDetails}>
          <Text style={styles.totalHeaderText}>{totalItems} Items</Text>
          <Text style={styles.dot}>{" \u25CF"}</Text>
          <Text style={styles.totalHeaderText}>{totalCarts} Store(s)</Text>
        </View>
      </View>
      <View style={styles.listWrapper}>
        <FlashList
          data={[...carts].reverse()}
          renderItem={({ item }) => (
            <CartCard
              id={item._id}
              store={item.store}
              items={item.cart_items}
              onCartChange={loadCarts}
            />
          )}
          estimatedItemSize={83}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9ecef",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "white",
    elevation: 2,
  },
  headerDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  totalHeaderText: {
    fontSize: 14,
  },
  dot: {
    color: "#848080",
    fontSize: 12,
  },
  listWrapper: {
    minHeight: 2,
    paddingVertical: 10,
  },
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 30,
  },
  emptyTextContainer: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#292935",
    fontWeight: "600",
    fontSize: 20,
  },
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
  startShoppingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 20,
  },
});

export default CartScreen;
