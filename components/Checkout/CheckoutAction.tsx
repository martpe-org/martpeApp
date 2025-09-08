import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Loader from "../common/Loader";

interface CheckoutActionsProps {
  hasOutOfStockItems: boolean;
  selectedFulfillmentId: string;
  paymentLoading: boolean;
  totalAmount: number;
  onPayment: () => void;
}

export const CheckoutActions: React.FC<CheckoutActionsProps> = ({
  hasOutOfStockItems,
  selectedFulfillmentId,
  paymentLoading,
  totalAmount,
  onPayment,
}) => {
  if (hasOutOfStockItems) return null;

  return (
    <View style={styles.paymentSection}>
      <TouchableOpacity
        style={[
          styles.paymentBtn,
          (!selectedFulfillmentId || paymentLoading) &&
            styles.paymentBtnDisabled,
        ]}
        onPress={onPayment}
        disabled={!selectedFulfillmentId || paymentLoading}
        activeOpacity={0.8}
      >
        {paymentLoading ? (
          <View style={styles.loadingContainer}>
            <Loader />
            <Text style={styles.paymentBtnText}>Processing Payment...</Text>
          </View>
        ) : (
          <View style={styles.paymentContainer}>
            <Text style={styles.paymentBtnText}>
              Pay ₹{totalAmount}
            </Text>
            <MaterialIcons name="lock" size={20} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.secureText}>🔒 Secure payment powered by Razorpay</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  paymentSection: {
    paddingVertical: 16,
    alignItems: "center",
  },
  paymentBtn: {
    backgroundColor: "red",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "pink",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    width: "100%",
    maxWidth: 400,
  },
  paymentBtnDisabled: {
    backgroundColor: "#a0a0a0",
    shadowOpacity: 0.1,
  },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  paymentBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  secureText: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
});
