import React, { useRef } from "react";
import { Animated, Alert } from "react-native";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface LikeButtonProps {
  productId?: string;
  vendorId?: string;
  storeData?: any;
  color?: string;
}

const LikeButton = ({ productId, vendorId, storeData, color = "#000" }: LikeButtonProps) => {
  const { authToken } = useUserDetails();
  const { allFavorites, addFavorite, removeFavorite, addStoreFavorite, removeStoreFavorite } =
    useFavoriteStore();
  const toast = useToast();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const isStore = !!vendorId;
  const itemId = isStore ? vendorId : productId;

  // 🔑 Derive favorite state from Zustand instead of AsyncStorage
  const isFavorite =
    isStore
      ? allFavorites?.stores?.some((s) => s.id === itemId)
      : allFavorites?.products?.some((p) => p.id === itemId);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.85,
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
      Alert.alert("Login Required", "Please login to use favorites.");
      return;
    }
    if (!itemId) {
      console.error("No item ID provided");
      return;
    }

    try {
      if (isFavorite) {
        // REMOVE
        if (isStore) {
          await removeStoreFavorite(itemId, authToken);
          toast.show("Store removed from favorites", { type: "danger" });
        } else {
          await removeFavorite(itemId, authToken);
          toast.show("Removed from favorites", { type: "danger" });
        }
      } else {
        // ADD
        if (isStore && storeData) {
          await addStoreFavorite(storeData, authToken);
          toast.show("Store added to favorites", { type: "success" });
        } else if (!isStore) {
          await addFavorite(itemId, authToken);
          toast.show("Added to favorites", { type: "success" });
        }
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
      toast.show("Error updating favorites", { type: "danger" });
    }
  };

  return (
    <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <MaterialCommunityIcons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? color : "#000"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default LikeButton;
