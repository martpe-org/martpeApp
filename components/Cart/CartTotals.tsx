// components/Cart/CartTotals.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CartTotalsProps {
  subtotal: number;
  discount: number;
  total: number;
  appliedOfferId?: string;
}

const CartTotals: React.FC<CartTotalsProps> = ({
  subtotal,
  discount,
  total,
  appliedOfferId,
}) => {
  return (
    <View style={styles.totalsContainer}>
  

      {/* Discount */}
      {!!discount && (
        <View style={styles.discountRow}>
          <Text style={styles.discountLabel}>
            Discount {appliedOfferId ? `(${appliedOfferId})` : ""}
          </Text>
          <Text style={styles.discountAmount}>−₹{discount.toFixed(2)}</Text>
        </View>
      )}

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  totalsContainer: {
padding:10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  discountLabel: {
    fontSize: 14,
    color: "red",
  },
  discountAmount: {
    fontSize: 14,
    color: "red",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A202C",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "black",
  },
});

export default CartTotals;
