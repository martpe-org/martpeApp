import React, { useRef, useState, useEffect } from "react";
import { Animated, Alert, Text } from "react-native";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const FAVORITES_KEY = "favoriteItems";

interface LikeButtonProps {
  productId: string;
    color?: string;

}

const LikeButton = ({ productId, color = "#000"  }: LikeButtonProps) => {
  const { authToken } = useUserDetails();
  const { addFavorite, removeFavorite } = useFavoriteStore();
const toast = useToast()
  const [isFavorite, setIsFavorite] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  // ✅ Load persisted state from AsyncStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await getAsyncStorageItem(FAVORITES_KEY);
        const storedFavorites: string[] = data ? JSON.parse(data) : [];
        if (storedFavorites.includes(productId)) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error("Error loading favorites from storage:", err);
      }
    };
    loadFavorites();
  }, [productId]);

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

    try {
      // Load current favorites
      const data = await getAsyncStorageItem(FAVORITES_KEY);
      let storedFavorites: string[] = data ? JSON.parse(data) : [];

      if (isFavorite) {
        // ✅ REMOVE
        storedFavorites = storedFavorites.filter((id) => id !== productId);
        await removeFavorite(productId, authToken);
        setIsFavorite(false);
        toast.show("Removed from favorites ❤️", { type: "danger" });
      } else {
        // ✅ ADD
        storedFavorites.push(productId);
        await addFavorite(productId, authToken);
        setIsFavorite(true);
        toast.show("Added to favorites ❤️", { type: "success" });
      }

      // ✅ Persist update
      await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(storedFavorites));
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
          color={isFavorite ? color : "#000"} // ✅ respect prop
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default LikeButton;
