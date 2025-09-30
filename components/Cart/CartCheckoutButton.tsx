import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CartCheckoutButtonProps {
  onPress: () => void;
  disabled?: boolean;
  warning?: boolean;
}

const CartCheckoutButton: React.FC<CartCheckoutButtonProps> = ({
  onPress,
  disabled = false,
  warning = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  if (disabled) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>Continue to checkout</Text>
        </View>
        <Text style={styles.footerText}>Taxes & shipping calculated at checkout</Text>
      </View>
    );
  }

  if (warning) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.warningButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons
              name={"alert-circle-outline"}
              size={20}
              color={"#856404"}
            />
            <Text style={styles.warningText}>Continue to checkout</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.footerText}>Taxes & shipping calculated at checkout</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkout}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <MaterialCommunityIcons
            name={"cart-outline"}
            size={20}
            color={"white"}
          />
          <Text style={styles.checkoutText}>
            Continue to checkout
          </Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.footerText}>Taxes & shipping calculated at checkout</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  checkout: {
    backgroundColor: "#f86d6d",
    padding: 14,
    margin: 6,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#f14343",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#e5e5e5",
    padding: 14,
    margin: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#fff3cd",
    padding: 14,
    margin: 6,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  warningText: {
    color: "#856404",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  footerText: {
    color: "#777",
    fontSize: 12,
    alignSelf: "center",
    padding: 4,
    textAlign: "center",
  },
});

export default CartCheckoutButton;