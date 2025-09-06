import React from "react";
import { View, StyleSheet } from "react-native";


// Simple skeleton placeholder component
const SkeletonItem: React.FC<{ width: number | string; height: number; style?: any }> = ({ width, height, style }) => (
  <View style={[styles.skeleton, { width, height }, style]} />
);

const CheckoutSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Store Details Skeleton */}
      <View style={styles.section}>
        <SkeletonItem width={120} height={20} style={styles.title} />
        <View style={styles.storeCard}>
          <SkeletonItem width={60} height={60} style={styles.storeImage} />
          <View style={styles.storeInfo}>
            <SkeletonItem width="70%" height={16} style={styles.storeName} />
            <SkeletonItem width="90%" height={14} style={styles.storeAddress} />
          </View>
        </View>
      </View>

      {/* Delivery Address Skeleton */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonItem width={140} height={20} />
          <SkeletonItem width={60} height={32} style={styles.editBtn} />
        </View>
        <View style={styles.addressCard}>
          <SkeletonItem width="50%" height={16} style={styles.addressName} />
          <SkeletonItem width="95%" height={14} style={styles.addressText} />
          <SkeletonItem width="70%" height={14} />
        </View>
      </View>

      {/* Cart Items Skeleton */}
      <View style={styles.section}>
        <SkeletonItem width={100} height={20} style={styles.title} />
        <View style={styles.itemsContainer}>
          {[1, 2].map((item) => (
            <View key={item} style={styles.itemCard}>
              <SkeletonItem width={60} height={60} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <SkeletonItem width="80%" height={16} style={styles.itemName} />
                <SkeletonItem width="40%" height={14} style={styles.itemQty} />
                <SkeletonItem width="60%" height={12} />
              </View>
              <SkeletonItem width={50} height={16} />
            </View>
          ))}
        </View>
      </View>

      {/* Delivery Options Skeleton */}
      <View style={styles.section}>
        <SkeletonItem width={130} height={20} style={styles.title} />
        <View style={styles.fulfillmentContainer}>
          {[1, 2].map((option) => (
            <View key={option} style={styles.fulfillmentOption}>
              <SkeletonItem width={20} height={20} style={styles.radio} />
              <View style={styles.fulfillmentDetails}>
                <SkeletonItem width="60%" height={16} style={styles.fulfillmentText} />
                <SkeletonItem width="80%" height={14} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Order Summary Skeleton */}
      <View style={styles.section}>
        <SkeletonItem width={120} height={20} style={styles.title} />
        <View style={styles.summaryContainer}>
          {[1, 2, 3].map((row) => (
            <View key={row} style={styles.summaryRow}>
              <SkeletonItem width="40%" height={14} />
              <SkeletonItem width={60} height={14} />
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <SkeletonItem width="30%" height={16} />
            <SkeletonItem width={80} height={18} />
          </View>
        </View>
      </View>

      {/* Payment Button Skeleton */}
      <View style={styles.paymentSection}>
        <SkeletonItem width="100%" height={56} style={styles.paymentBtn} />
      </View>
    </View>
  );
};

export default CheckoutSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  skeleton: {
    backgroundColor: "#e1e5e9",
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editBtn: {
    borderRadius: 6,
  },

  // Store Card
  storeCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeImage: {
    marginRight: 12,
    borderRadius: 8,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    marginBottom: 4,
  },
  storeAddress: {
    marginBottom: 0,
  },

  // Address Card
  addressCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressName: {
    marginBottom: 4,
  },
  addressText: {
    marginBottom: 4,
  },

  // Items
  itemsContainer: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    marginRight: 12,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    marginBottom: 4,
  },
  itemQty: {
    marginBottom: 2,
  },

  // Fulfillment Options
  fulfillmentContainer: {
    gap: 12,
  },
  fulfillmentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  radio: {
    borderRadius: 10,
    marginRight: 12,
  },
  fulfillmentDetails: {
    flex: 1,
  },
  fulfillmentText: {
    marginBottom: 2,
  },

  // Summary
  summaryContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 8,
  },

  // Payment Button
  paymentSection: {
    paddingVertical: 16,
  },
  paymentBtn: {
    borderRadius: 12,
  },
});