import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import useUserDetails from "../../hook/useUserDetails";
import useDeliveryStore from "../address/deliveryAddressStore";
import Loader from "../common/Loader";

interface YourDetailsProps {
  onDeliveryInstructionsChange?: (instructions: string) => void;
}

export const YourDetails: React.FC<YourDetailsProps> = ({
  onDeliveryInstructionsChange,
}) => {
  const { userDetails, isLoading } = useUserDetails();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const handleInstructionsChange = useCallback(
    (text: string) => {
      setDeliveryInstructions(text);
      onDeliveryInstructionsChange?.(text);
    },
    [onDeliveryInstructionsChange]
  );

  // Show loading indicator while user details are being fetched
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Loader color="#666" />
      </View>
    );
  }

  // Show message if user details are not available
  if (!userDetails) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Unable to load user details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Name */}
      <View style={styles.row}>
        <Text style={[styles.value, styles.bold]}>
          {userDetails.firstName} {userDetails.lastName}
        </Text>
      </View>

      {/* Phone Number */}
      <View style={styles.row}>
        <Text style={styles.value}>{userDetails.phoneNumber}</Text>
      </View>

      {/* Delivery Address */}
      <View style={styles.row}>
        <Text style={styles.value}>
          {selectedDetails?.fullAddress || "No address selected"}
        </Text>
      </View>

      {/* Delivery Instructions */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Delivery Instructions</Text>
        <TextInput
          style={styles.input}
          placeholder="Add delivery instructions (optional)..."
          textAlignVertical="top"
          multiline
          numberOfLines={3}
          value={deliveryInstructions}
          onChangeText={handleInstructionsChange}
          maxLength={200}
        />
        <Text style={styles.charCount}>{deliveryInstructions.length}/200</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "white",
    marginHorizontal: 15,
    shadowColor: "rgba(0,0,0,0.5)",
    elevation: 2,
    marginTop: 15,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  row: {
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
});
