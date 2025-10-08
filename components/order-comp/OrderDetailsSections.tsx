import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
<MaterialCommunityIcons name="truck-delivery-outline" size={24} color="black" />       
   <Text style={styles.sectionTitle}>Delivery details</Text>
        </View>
        <View style={styles.deliveryInfo}>
<View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <MaterialCommunityIcons name="account-outline" size={16} color="black" style={styles.Icon} />
          <Text style={styles.customerName}>
            {orderDetail.delivery_address.name}
          </Text>
</View>
<View style={{ flexDirection: 'row', alignItems: 'center', }}>
<Ionicons name="call" size={14} color="black" style={styles.Icon}/>
          <Text style={styles.phoneNumber}>
            {orderDetail.delivery_address.phone}
          </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', }}>
<Entypo name="location" size={14} color="black" style={styles.Icon}/>
          <Text style={styles.address}>
            {orderDetail.delivery_address.houseNo},{" "}
            {orderDetail.delivery_address.street},{" "}
            {orderDetail.delivery_address.city},{" "}
            {orderDetail.delivery_address.state},{" "}
            {orderDetail.delivery_address.pincode}
          </Text>
          </View>
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
    padding: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f5f3f3",
    padding: 8,
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
    marginLeft: 10,
  },
  Icon:{
marginLeft:-25
  },
  phoneNumber: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
    marginLeft: 10,
  },
  address: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginLeft:10
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
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
});
