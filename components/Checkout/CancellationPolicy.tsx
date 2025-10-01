import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CancellationPolicyProps {
  isCancellable: boolean;
}

export const CancellationPolicy: React.FC<CancellationPolicyProps> = ({ 
  isCancellable 
}) => {
  const message = isCancellable
    ? "This order can be cancelled before it is shipped by the seller."
    : "This order cannot be cancelled once it is shipped by the seller.";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>CANCELLATION POLICY</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.value}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "#f0ffff",
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    padding: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  title: { 
    paddingVertical: 10, 
    fontWeight: "600", 
    fontSize: 12,
    color: "#333",
    letterSpacing: 0.5,
  },
  row: {
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});