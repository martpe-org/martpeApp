import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import CartCard from "../../../components/Cart/CartCard";
import { useCartStore } from "../../../state/useCartStore";
import { FlashList } from "@shopify/flash-list";
import { BackArrow } from "../../../constants/icons/commonIcons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchCarts } from "./fetch-carts";
import { FetchCartType } from "./fetch-carts-type";
import  useUserDetails  from "../../../hook/useUserDetails";

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

const { userDetails, isLoading: isUserLoading } = useUserDetails();
const authToken = userDetails?.accessToken;

useEffect(() => {
  const loadCarts = async () => {
    if (!authToken) {
      console.log("No auth token available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedCarts = await fetchCarts(authToken);
      if (fetchedCarts) {
        setCarts(fetchedCarts);
      }
    } catch (error) {
      console.error("Error fetching carts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isUserLoading) {
    loadCarts();
  }
}, [authToken, isUserLoading]);
if (isUserLoading || loading) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}

  if (carts.length === 0)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingBottom: 30,
        }}
      >
        {/* cart text */}
        <View
          style={{
            backgroundColor: "#fff",
            width: widthPercentageToDP(100),
            alignItems: "center",
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: "bold", color: "#000" }}>
            Cart
          </Text>
        </View>

        {/*  empty cart lottie */}
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

        {/*  Your cart is empty  */}
        <View style={{ height: 50, alignItems: "center" }}>
          <Text style={{ color: "#909095", fontWeight: "600", fontSize: 20 }}>
            Your Cart is Empty.!
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "../(tabs)/home" })}
          style={{
            backgroundColor: "#030303",
            width: widthPercentageToDP("90"),
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 50,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 20 }}>
            Start Shopping
          </Text>
        </TouchableOpacity>
      </View>
    );

  const { totalCarts, totalItems } = calculateTotals(carts);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.title}>
        <BackArrow
          onPress={() => {
            router.back();
          }}
        />
        <Text style={styles.titleText}>
          {carts?.length > 1 ? "My Carts" : "My Cart"}
        </Text>
      </View>

      <View style={styles.header}>
        <MaterialCommunityIcons name="cart" size={16} color="black" />
        <View style={styles.headerDetails}>
          <Text style={styles.totalHeaderText}>{totalItems} Items</Text>
          <Text style={{ color: "#848080", fontSize: 12 }}>{" \u25CF"}</Text>
          <Text style={styles.totalHeaderText}>{totalCarts} Store(s)</Text>
        </View>
      </View>

      <View style={{ minHeight: 2, paddingVertical: 10 }}>
        <FlashList
          data={carts.reverse()}
          renderItem={({ item }) => (
            <>
              <CartCard 
                id={item._id} 
                store={item.store} 
                items={item.cart_items} 
              />
            </>
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
  title: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
            marginTop:20

  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
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
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});

export default CartScreen;