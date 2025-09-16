import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { OrdersListWrapper } from "@/components/order-comp/OrdersListWrapper";
import { FetchOrdersListItemType } from "@/components/order/fetch-orders-list-type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchOrderList } from "@/components/order/fetch-orders-list";
import Loader from "@/components/common/Loader";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function OrdersScreen() {
  const [initialOrders, setInitialOrders] = useState<FetchOrdersListItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const authToken = await AsyncStorage.getItem("auth-token");
        if (!authToken) {
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetchOrderList(authToken, "1", "10");
        if (!response) throw new Error("No response from server");

        setInitialOrders(response.orders);
        setTotal(response.count);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.centered}>
          <Loader />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            {total} order{total !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Orders List */}
      <OrdersListWrapper orders={initialOrders} pageSize={10} total={total} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6b7280" },
  errorText: { fontSize: 18, fontWeight: "600", color: "#dc2626", marginBottom: 6 },
  errorSubtext: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  retryBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
    elevation: 2,
    marginTop: 10
  },
  backButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#f9fafb",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6b7280" },
});
