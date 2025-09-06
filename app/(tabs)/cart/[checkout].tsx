import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "@/hook/useUserDetails";
import { fetchCarts } from "@/app/(tabs)/cart/fetch-carts";
import CheckoutBtn from "@/components/Checkout/CheckoutBtn";
import { Entypo } from "@expo/vector-icons";
import Loader from "@/components/common/Loader";

export default function CheckoutScreen() {
  const { checkout: cartId } = useLocalSearchParams<{
    checkout: string;
    storeId?: string;
  }>();

  const {
    userDetails,
    isLoading: userLoading,
    isAuthenticated,
  } = useUserDetails();
  const [cart, setCart] = useState<FetchCartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cartId) {
      Alert.alert("Error", "No cart ID provided", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    // ✅ Wait for user details to finish loading before proceeding
    if (userLoading) {
      return; // Still loading user details
    }

    // ✅ Check authentication after user details have loaded
    if (!isAuthenticated || !userDetails?.accessToken) {
      Alert.alert("Error", "Please login to continue", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    fetchCartData();
  }, [cartId, userDetails, userLoading, isAuthenticated]);

  const fetchCartData = async () => {
    try {
      if (!userDetails?.accessToken) {
        throw new Error("No access token");
      }

      const carts = await fetchCarts(userDetails.accessToken);

      if (!carts) {
        throw new Error("Failed to fetch carts");
      }

      const targetCart = carts.find((c) => c._id === cartId);

      if (!targetCart) {
        throw new Error("Cart not found");
      }

      // Validate cart has items
      if (!targetCart.items?.length && !targetCart.cart_items?.length) {
        throw new Error("Cart is empty");
      }

      setCart(targetCart);
    } catch (err: any) {
      console.error("CheckoutScreen: Error fetching cart", err);
      setError(err.message || "Failed to load cart");

      Alert.alert("Error", err.message || "Failed to load cart", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loader />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loader />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </SafeAreaView>
    );
  }

  if (error || !cart) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>
            {error || "Unable to load checkout"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Entypo name="chevron-left" size={26} color="#111" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Checkout</Text>
              <Text style={styles.subtitle}>Review your order</Text>
            </View>
          </View>

          <CheckoutBtn cart={cart} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    padding: 4,
    marginTop: -19,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#d73a49",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
