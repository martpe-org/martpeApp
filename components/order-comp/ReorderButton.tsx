import { useCart } from "@/hook/CartProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { reOrder } from "../order/Reorder";

interface Props {
  orderId: string;
  storeId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export function ReorderButton({
  orderId,
  storeId,
  variant = "outline",
  size = "sm",
  style,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const cart = useCart();
  const reorderCartState = cart((state) => state.reorder);
  const router = useRouter();

  const handleReorder = async () => {
    setIsLoading(true);

    try {
      const authToken = await AsyncStorage.getItem("auth-token");

      if (!authToken) {
        Alert.alert("Error", "Authentication required. Please login again.");
        router.push("/home/HomeScreen");
        return;
      }

      const data = await reOrder(orderId, storeId, authToken);

      if (data && data.length > 0) {
        reorderCartState(data);
        // ✅ Navigate directly instead of showing alert
        router.push("/cart");
      } else {
        Alert.alert(
          "Error",
          "No items found to reorder or something went wrong!"
        );
      }
    } catch (error) {
      console.error("Reorder error:", error);
      Alert.alert("Error", "Failed to reorder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyle = (): (ViewStyle | TextStyle)[] => {
    const baseStyle: (ViewStyle | TextStyle)[] = [styles.button];

    switch (variant) {
      case "default":
        baseStyle.push(styles.defaultButton);
        break;
      case "outline":
        baseStyle.push(styles.outlineButton);
        break;
      case "ghost":
        baseStyle.push(styles.ghostButton);
        break;
    }

    switch (size) {
      case "sm":
        baseStyle.push(styles.smallButton);
        break;
      case "md":
        baseStyle.push(styles.mediumButton);
        break;
      case "lg":
        baseStyle.push(styles.largeButton);
        break;
    }

    if (isLoading) {
      baseStyle.push(styles.disabledButton);
    }

    if (style) baseStyle.push(style);

    return baseStyle;
  };

  const getTextStyle = (): (TextStyle | ViewStyle)[] => {
    const baseStyle: (TextStyle | ViewStyle)[] = [styles.buttonText];

    switch (variant) {
      case "default":
        baseStyle.push(styles.defaultText);
        break;
      case "outline":
        baseStyle.push(styles.outlineText);
        break;
      case "ghost":
        baseStyle.push(styles.ghostText);
        break;
    }

    switch (size) {
      case "sm":
        baseStyle.push(styles.smallText);
        break;
      case "md":
        baseStyle.push(styles.mediumText);
        break;
      case "lg":
        baseStyle.push(styles.largeText);
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handleReorder}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={getTextStyle()}>Reorder</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  // Variant styles
  defaultButton: {
    backgroundColor: "#ef4444",
  },
  outlineButton: {
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },

  // Size styles
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 100,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minWidth: 120,
  },

  // Text styles
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
  defaultText: {
    color: "#ffffff",
  },
  outlineText: {
    color: "#ffffff",
  },
  ghostText: {
    color: "#ef4444",
  },

  // Size text styles
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },

  // Disabled state
  disabledButton: {
    opacity: 0.6,
  },
});
