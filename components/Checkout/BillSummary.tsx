import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface BillBreakup {
  title?: string;
  custom_title?: string;
  price: number;
}

interface BillSummaryProps {
  subTotal: number;
  breakups: BillBreakup[];
  totalSavings: number;
  grandTotal: number;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  subTotal,
  breakups,
  totalSavings,
  grandTotal,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill Summary</Text>
      
      <View style={styles.priceContainer}>
        <View style={styles.row}>
          <Text style={styles.text}>Items Total</Text>
          <Text style={styles.text}>₹{subTotal}</Text>
        </View>
        
        {breakups.map((breakup, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.text}>
              {breakup.custom_title || breakup.title}
            </Text>
            <Text style={styles.text}>₹{breakup.price}</Text>
          </View>
        ))}
        
        {totalSavings > 0 && (
          <View style={styles.row}>
            <Text style={[styles.text, styles.savingsText]}>Total Savings</Text>
            <Text style={[styles.text, styles.savingsText]}>-₹{totalSavings}</Text>
          </View>
        )}
        
        <View style={[styles.row, styles.totalRow]}>
          <Text style={[styles.text, styles.bold]}>Grand Total</Text>
          <Text style={[styles.text, styles.bold]}>₹{grandTotal}</Text>
        </View>
        
        {totalSavings > 0 && (
          <View style={styles.savingsMessage}>
            <MaterialIcons name="savings" size={16} color="#27ae60" />
            <Text style={styles.savingsMessageText}>
              You saved ₹{totalSavings.toFixed(2).replace(/\.?0+$/, "")} on this order!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  priceContainer: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  text: {
    fontSize: 14,
    color: "#666",
  },
  bold: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  savingsText: {
    color: "#27ae60",
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 8,
  },
  savingsMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  savingsMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#27ae60",
    fontWeight: "500",
  },
});