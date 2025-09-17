import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FetchOrderDetailType } from "@/components/order/fetch-order-detail-type";

interface OrderDetailsSectionsProps {
  orderDetail: FetchOrderDetailType;
}

export default function OrderDetailsSections({
  orderDetail,
}: OrderDetailsSectionsProps) {
  // Find delivery charges from breakup
  const deliveryCharge =
    orderDetail.breakup.find(
      (item) => item.title && item.title.toLowerCase().includes("delivery")
    )?.price ?? 0;

  // Find platform fee (if exists in breakup)
  const platformFee =
    orderDetail.breakup.find(
      (item) => item.title && item.title.toLowerCase().includes("platform")
    )?.price ?? 0;

  // Find restaurant charges (if exists in breakup)
  const restaurantCharges =
    orderDetail.breakup.find(
      (item) =>
        item.title && item.title.toLowerCase().includes("restaurant")
    )?.price ?? 0;

  return (
    <>
      {/* Delivery Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={20} color="#6b7280" />
          <Text style={styles.sectionTitle}>Delivery details</Text>
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.customerName}>
            {orderDetail.delivery_address.name}
          </Text>
          <Text style={styles.phoneNumber}>
            {orderDetail.delivery_address.phone}
          </Text>
          <Text style={styles.address}>
            {orderDetail.delivery_address.houseNo},{" "}
            {orderDetail.delivery_address.street},{" "}
            {orderDetail.delivery_address.city},{" "}
            {orderDetail.delivery_address.state},{" "}
            {orderDetail.delivery_address.pincode}
          </Text>
          {/* Category & provider pulled dynamically */}
          {orderDetail.fulfillment?.category && (
            <Text style={styles.deliveryCategory}>
              Category: {orderDetail.fulfillment.category}
            </Text>
          )}
          {orderDetail.fulfillment?.provider_name && (
            <Text style={styles.deliveryProvider}>
              Delivery provider: {orderDetail.fulfillment.provider_name}
            </Text>
          )}
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="receipt-outline" size={20} color="#6b7280" />
          <Text style={styles.sectionTitle}>Order summary</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Total</Text>
          <Text style={styles.summaryValue}>
            ₹{orderDetail.sub_total.toFixed(2)}
          </Text>
        </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform fee</Text>
            <Text style={styles.summaryValue}>₹ {platformFee.toFixed(2)}</Text>
          </View>


          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery charges</Text>
            <Text style={styles.summaryValue}>
              ₹ {deliveryCharge.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Restaurant charges</Text>
            <Text style={styles.summaryValue}>
              ₹ {restaurantCharges.toFixed(2)}
            </Text>
          </View>
        

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            ₹{orderDetail.total.toFixed(2)}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  deliveryInfo: {
    marginLeft: 28,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  deliveryCategory: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  deliveryProvider: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});
