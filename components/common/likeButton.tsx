import React, { useRef } from "react";
import { Animated, Alert } from "react-native";
import useUserDetails from "../../hook/useUserDetails";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { Toast } from "react-native-toast-notifications";

interface LikeButtonProps {
  productId: string;
  color?: string;
}

const LikeButton = ({ productId, color }: LikeButtonProps) => {
  const { authToken } = useUserDetails(); // ✅ get token here
  const { addFavorite, removeFavorite, allFavorites } = useFavoriteStore();

  // Check if this product is already in favorites
  const isFavorite = allFavorites?.products?.some(
    (item) => item.id === productId
  );

  // Animation value
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = async () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // ✅ Check authentication before proceeding
    if (!authToken) {
      console.warn("User not authenticated - showing alert");
      Alert.alert(
        "Authentication Required",
        "Please log in to add items to your favorites.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () => {
              console.log("Navigate to login screen");
            },
          },
        ]
      );
      return;
    }

    console.log(
      `🎯 LikeButton: ${isFavorite ? "Removing" : "Adding"} favorite for product: ${productId}`
    );

    try {
      if (isFavorite) {
        await removeFavorite(productId, authToken); // ✅ pass token
        Toast.show("✅ Successfully removed from favorites");
      } else {
        await addFavorite(productId, authToken); // ✅ pass token
        Toast.show("✅ Successfully added to favorites");
      }
    } catch (error) {
      console.error("❌ Error updating favorite:", error);
      Alert.alert(
        "Error",
        "There was an error updating your favorites. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <MaterialCommunityIcons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? "#FB3E44" : color || "#000"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default LikeButton;
