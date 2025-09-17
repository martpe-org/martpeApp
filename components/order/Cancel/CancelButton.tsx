// components/order/CancelButton.tsx
import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useUserDetails from "@/hook/useUserDetails";
import { cancelOrder } from "./cancel";
import { ActivityIndicator } from "react-native-paper";

interface CancelButtonProps {
  orderId: string;
  onCancelled: () => void; // callback to refresh the order after cancel
  isCancelled?: boolean; // receive the actual cancelled status from parent
  cancellable?: boolean; // receive cancellable status from parent
}

export default function CancelButton({
  orderId,
  onCancelled,
  isCancelled = false,
  cancellable = true,
}: CancelButtonProps) {
  const [loading, setLoading] = useState(false);
  const { authToken } = useUserDetails();

  const handleCancel = async () => {
    if (!authToken) {
      Alert.alert("Error", "You must be logged in to cancel this order.");
      return;
    }

    if (!cancellable) {
      Alert.alert("Cannot Cancel", "This order is not cancellable.");
      return;
    }

    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await cancelOrder(orderId, "user_request", authToken);

              if (res.success) {
                onCancelled(); // Refresh the order data
                Alert.alert("Success", "Order has been cancelled successfully.");
              } else {
                Alert.alert("Error", res.error || "Failed to cancel order.");
              }
            } catch (err) {
              console.error("Cancel order error:", err);
              Alert.alert("Error", "Something went wrong while cancelling.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // If order is already cancelled, show cancelled state
  if (isCancelled) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.cancelledButton]}
        disabled={true}
      >
        <Text style={styles.cancelledText}>Cancelled</Text>
      </TouchableOpacity>
    );
  }

  // If order is not cancellable, show appropriate message
  if (!cancellable) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.notCancellableButton]}
        disabled={true}
      >
        <Text style={styles.notCancellableText}>Not Cancellable</Text>
      </TouchableOpacity>
    );
  }

  // Show active cancel button
  return (
    <TouchableOpacity
      style={[styles.button, styles.cancelButton]}
      onPress={handleCancel}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ef4444" />
      ) : (
        <>
          <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
          <Text style={styles.buttonText}>Cancel Order</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  cancelledButton: {
    backgroundColor: "#6b7280",
    borderWidth: 1,
    borderColor: "#6b7280",
  },
  notCancellableButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  buttonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelledText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  notCancellableText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 14,
  },
});