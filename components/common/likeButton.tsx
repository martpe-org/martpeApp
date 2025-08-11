import React, { useRef } from "react";
import { Pressable, Animated } from "react-native";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface LikeButtonProps {
  productId: string;
  color?: string;
}

const LikeButton = ({ productId, color }: LikeButtonProps) => {
  const { addFavorite, removeFavorite, allFavorites } = useFavoriteStore();
  
  // Check if this product is already in favorites
  const isFavorite = allFavorites?.products?.some((item) => item.id === productId);

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

    if (isFavorite) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <MaterialCommunityIcons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? "#FB3E44" : color || "#000"}
        />
      </Animated.View>
    </Pressable>
  );
};

export default LikeButton;
