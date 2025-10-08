import ImageComp from "@/components/common/ImageComp";
import { FetchOrdersListItemType } from "@/components/order/fetch-orders-list-type";
import { format } from "@formkit/tempo";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ReorderButton } from "./ReorderButton";
interface Props {
  order: FetchOrdersListItemType;
}

export function AllOrderDetailsCard({ order }: Props) {
  const router = useRouter();

  const getStatusConfig = () => {
    switch (order.status.toLowerCase()) {
      case "created":
      case "initiated":
        return {
          label: "Confirmed",
          backgroundColor: "#dbeafe",
          color: "#1d4ed8",
        };
      case "confirmed":
      case "accepted":
        return {
          label: "Confirmed",
          backgroundColor: "#dcfce7",
          color: "#16a34a",
        };
      case "in-progress":
        return {
          label: "In Progress",
          backgroundColor: "#fed7aa",
          color: "#ea580c",
        };
      case "completed":
        return {
          label: "Completed",
          backgroundColor: "#d1fae5",
          color: "#059669",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          backgroundColor: "#fee2e2",
          color: "#dc2626",
        };
      default:
        return {
          label: "Unknown",
          backgroundColor: "#f3f4f6",
          color: "#374151",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formattedDate = format({
    date: order.createdAt,
    format: "MMM D, YYYY h:mm a",
    tz: "Asia/Kolkata",
  });

  const handlePress = () => {
    router.push({
      pathname: `/orders/[orderId]`,
      params: { orderId: order._id },
    });
  };

  // Helper function to get valid image source
  const getImageSource = () => {
    const symbol = order.store?.symbol;
    // Check if symbol exists and is a valid string
    if (symbol && typeof symbol === 'string' && symbol.trim() !== '') {
      // Ensure it's a valid URL
      if (symbol.startsWith('http://') || symbol.startsWith('https://')) {
        return { uri: symbol.trim() };
      }
    }
    
    return null; // Let ImageComp handle fallback
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <View style={styles.logoContainer}>
            <ImageComp
              source={getImageSource()}
              imageStyle={styles.storeLogo}
              fallbackSource={{
                uri: "https://via.placeholder.com/44x44/e5e7eb/6b7280?text=Store",
              }}
              resizeMode="cover"
              loaderColor="#6b7280"
              loaderSize="small"
            />
          </View>

          <View style={styles.storeDetails}>
            <Text style={styles.storeName} numberOfLines={1}>
              {order.store?.name || 'Store'}
            </Text>
            <Text style={styles.orderNumber}>Order #{order.orderno}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.itemsSection}>
        <Text style={styles.itemsTitle}>Order Items:</Text>
        {order.order_items.slice(0, 3).map((item) => (
          <View key={item._id} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.order_qty} × {item.name}
            </Text>
            <Text style={styles.itemPrice}>₹{item.total_price.toFixed(2)}</Text>
          </View>
        ))}
        {order.order_items.length > 3 && (
          <Text style={styles.moreItems}>
            +{order.order_items.length - 3} more items...
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.orderInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ordered</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.totalPrice}>₹{order.total.toFixed(2)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Items</Text>
            <Text style={styles.infoValue}>{order.order_items.length}</Text>
          </View>
        </View>

        <ReorderButton orderId={order._id} storeId={order.store_id} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: "#f3f4f6", // Added background color for better fallback
  },
  storeLogo: {
    width: 44, // Fixed dimensions instead of percentage
    height: 44,
    borderRadius: 8,
  },
  storeDetails: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  orderNumber: { fontSize: 12, color: "#6b7280" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  itemsSection: { paddingHorizontal: 14, paddingVertical: 10 },
  itemsTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: { fontSize: 13, color: "#4b5563", flex: 1, marginRight: 6 },
  itemPrice: { fontSize: 13, fontWeight: "500", color: "#111827" },
  moreItems: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 3,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  orderInfo: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    marginRight: 8,
  },
  infoItem: { alignItems: "center" },
  infoLabel: { fontSize: 10, color: "#9ca3af" },
  infoValue: { fontSize: 12, fontWeight: "500", color: "#111827" },
  totalPrice: { fontSize: 14, fontWeight: "bold", color: "#111827" },
});