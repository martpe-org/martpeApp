import React, { useRef, useState, useEffect } from "react";
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
  const { authToken } = useUserDetails();
  const { addFavorite, removeFavorite, allFavorites } = useFavoriteStore();

  // Local optimistic state for instant UI feedback
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);

  // Animation value
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Sync optimistic state with store when store updates
  useEffect(() => {
    setOptimisticFavorite(null); // reset optimistic state on store change
  }, [allFavorites, productId]);

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

    if (!authToken) {
      Alert.alert("Authentication Required", "Please log in to add favorites.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => console.log("Navigate to login screen") },
      ]);
      return;
    }

    const isCurrentlyFavorite = allFavorites?.products?.some(
      (item) => item.id === productId
    );

    // Optimistic toggle
    setOptimisticFavorite(!isCurrentlyFavorite);

    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(productId, authToken);
        Toast.show("✅ Removed from favorites");
      } else {
        await addFavorite(productId, authToken);
        Toast.show("✅ Added to favorites");
      }
    } catch (error) {
      console.error("❌ Error updating favorite:", error);
      Alert.alert("Error", "Could not update favorites. Please try again.", [{ text: "OK" }]);
      setOptimisticFavorite(isCurrentlyFavorite); // rollback on error
    }
  };

  // Determine UI state: optimistic state > store state
  const isFavorite = optimisticFavorite !== null
    ? optimisticFavorite
    : allFavorites?.products?.some((item) => item.id === productId);

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
