import Loader from "@/components/common/Loader";
import OrderDetailsSections from "@/components/order-comp/OrderDetailsSections";
import OrderedItems from "@/components/order-comp/OrderedItems";
import OrderHeader from "@/components/order-comp/OrderHeader";
import { fetchOrderDetail } from "@/components/order/fetch-order-detail";
import { FetchOrderDetailType } from "@/components/order/fetch-order-detail-type";
import useUserDetails from "@/hook/useUserDetails";
import { Ionicons } from "@expo/vector-icons";
import { format } from "@formkit/tempo";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


export default function OrderDetails() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const router = useRouter();

  const { authToken } = useUserDetails();  // 👈 grab token here

  const [orderDetail, setOrderDetail] = useState<FetchOrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrderDetail = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!authToken) {
        Alert.alert("Error", "Authentication required. Please login again.");
        return;
      }

      const detail = await fetchOrderDetail(authToken, orderId);
      if (!detail) throw new Error("Failed to fetch order details");

      setOrderDetail(detail);
    } catch (error) {
      console.error("Error loading order details:", error);
      Alert.alert("Error", "Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId && authToken) {
      loadOrderDetail();
    }
  }, [orderId, authToken]);  // 👈 run when token becomes available


  const handleRefresh = () => {
    loadOrderDetail(true);
  };

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          // Implement cancel order logic here
          console.log("Cancel order:", orderId);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.loadingContainer}>
          <Loader />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
          <Text style={styles.errorText}>Failed to load order details</Text>
          <Text style={styles.errorSubtext}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadOrderDetail()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedOrderDate = format({
    date: orderDetail.createdAt,
    format: "MMMM D, YYYY h:mm a",
    tz: "Asia/Kolkata",
  });

  const formattedDeliveryDate = format({
    date: orderDetail.createdAt,
    format: "MMM D, YYYY, h:mm A",
    tz: "Asia/Kolkata",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #: {orderDetail.orderno}</Text>
      </View>

      <ScrollView>
        <OrderHeader
          orderDetail={orderDetail}
          onRefresh={handleRefresh}
          onCancel={handleCancelOrder}
          refreshing={refreshing}
          formattedOrderDate={formattedOrderDate}
          formattedDeliveryDate={formattedDeliveryDate}
        />

        <OrderDetailsSections orderDetail={orderDetail} />

        <OrderedItems orderDetail={orderDetail} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
    elevation: 2,
  },
  backButton: {
    marginRight: 10,
    padding: 6,
    marginLeft: 10,
    borderRadius: 50,
    backgroundColor: "#f9fafb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
