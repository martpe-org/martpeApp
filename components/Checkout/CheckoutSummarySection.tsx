import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CheckoutSummarySectionProps {
  totalItems: number;
  totalPrice: number;
}

const CheckoutSummarySection: React.FC<CheckoutSummarySectionProps> = ({
  totalItems,
  totalPrice,
}) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <Text style={styles.itemCount}>{totalItems} items</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalPrice}>₹{totalPrice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00BC66",
  },
});

export default CheckoutSummarySection;