import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface BillBreakup {
  title?: string;
  custom_title?: string;
  price: number;
  children?: Array<{
    custom_title?: string;
    title?: string;
    price: number;
  }>;
}

interface BillSummaryProps {
  subTotal: number;
  breakups: BillBreakup[];
  totalSavings: number;
  grandTotal: number;
  onBreakupPress?: (breakup: BillBreakup) => void;
}

const formatPrice = (price: number): string => {
  if (typeof price !== "number" || isNaN(price)) {
    return "₹0";
  }
  return `₹${price.toFixed(2).replace(/\.?0+$/, "")}`;
};

export const BillSummary: React.FC<BillSummaryProps> = ({
  subTotal,
  breakups,
  totalSavings,
  grandTotal,
  onBreakupPress,
}) => {
  // Validate props and provide defaults
  const validSubTotal =
    typeof subTotal === "number" && !isNaN(subTotal) ? subTotal : 0;
  const validBreakups = Array.isArray(breakups) ? breakups : [];
  const validTotalSavings =
    typeof totalSavings === "number" && !isNaN(totalSavings) ? totalSavings : 0;
  const validGrandTotal =
    typeof grandTotal === "number" && !isNaN(grandTotal) ? grandTotal : 0;

  const renderBreakupItem = (breakup: BillBreakup, index: number) => {
    const hasChildren = breakup.children && breakup.children.length > 0;
    const title = breakup.custom_title || breakup.title || `Item ${index + 1}`;

    return (
      <TouchableOpacity
        key={`breakup-${index}`}
        style={[styles.row, hasChildren && styles.touchableRow]}
        onPress={
          hasChildren && onBreakupPress
            ? () => onBreakupPress(breakup)
            : undefined
        }
        disabled={!hasChildren || !onBreakupPress}
        activeOpacity={hasChildren ? 0.7 : 1}
      >
        <View style={styles.leftContainer}>
          <Text style={[styles.text, hasChildren && styles.linkText]}>
            {title}
          </Text>
          {hasChildren && (
            <MaterialIcons
              name="info-outline"
              size={16}
              color="#666"
              style={styles.infoIcon}
            />
          )}
        </View>
        <Text style={styles.text}>{formatPrice(breakup.price)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bill Summary</Text>

      <View style={styles.priceContainer}>
        {/* Items Total */}
        <View style={styles.row}>
          <Text style={styles.text}>Items Total</Text>
          <Text style={styles.text}>{formatPrice(validSubTotal)}</Text>
        </View>

        {/* Breakups */}
        {validBreakups.map((breakup, index) =>
          renderBreakupItem(breakup, index)
        )}

        {/* Total Savings */}
        {validTotalSavings > 0 && (
          <View style={styles.row}>
            <View style={styles.savingsContainer}>
              <MaterialIcons name="local-offer" size={16} color="#d3273e" />
              <Text style={[styles.text, styles.savingsText]}>
                Total Savings
              </Text>
            </View>
            <Text style={[styles.text, styles.savingsText]}>
              - {formatPrice(validTotalSavings)}
            </Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Grand Total */}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={[styles.text, styles.bold]}>Grand Total</Text>
          <Text style={[styles.text, styles.bold, styles.totalPrice]}>
            {formatPrice(validGrandTotal)}
          </Text>
        </View>

        {/* Savings Message */}
        {validTotalSavings > 0 && (
          <View style={styles.savingsMessage}>
            <MaterialIcons name="savings" size={20} color="#27ae60" />
            <Text style={styles.savingsMessageText}>
              You saved {formatPrice(validTotalSavings)} on this order!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  priceContainer: {
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    minHeight: 32,
  },
  touchableRow: {
    borderRadius: 6,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  text: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
  },
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
    textDecorationStyle: "dashed",
  },
  infoIcon: {
    marginLeft: 6,
  },
  bold: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  totalPrice: {
    fontSize: 18,
    color: "#000",
  },
  savingsText: {
    color: "red",
    fontWeight: "500",
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  totalRow: {
    paddingTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  savingsMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#27ae60",
  },
  savingsMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#27ae60",
    fontWeight: "500",
  },
});
