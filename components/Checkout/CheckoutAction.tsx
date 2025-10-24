import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, } from "@expo/vector-icons";
import Loader from "../common/Loader";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={styles.paymentSection}>
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
              Proceed to payment
            </Text>
            <Ionicons name="arrow-forward-outline" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  paymentSection: {
    alignItems: "center",
  },
  paymentBtn: {
    backgroundColor: "limegreen",
    borderRadius: 12,
    paddingVertical: 13,
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
    gap: 6,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4
  },

});
