import React, { useRef, useState, useEffect } from "react";
import { Animated, Alert } from "react-native";
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
const STORE_FAVORITES_KEY = "favoriteStores";

interface LikeButtonProps {
  productId?: string;
  vendorId?: string;
  color?: string;
}

const LikeButton = ({ productId, vendorId, color = "#000" }: LikeButtonProps) => {
  const { authToken } = useUserDetails();
  const { addFavorite, removeFavorite, addStoreFavorite, removeStoreFavorite } = useFavoriteStore();
  const toast = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Determine what we're working with
  const isStore = !!vendorId;
  const itemId = isStore ? vendorId : productId;
  const storageKey = isStore ? STORE_FAVORITES_KEY : FAVORITES_KEY;

  // Load persisted state from AsyncStorage
  useEffect(() => {
    if (!itemId) return;

    const loadFavorites = async () => {
      try {
        const data = await getAsyncStorageItem(storageKey);
        const storedFavorites: string[] = data ? JSON.parse(data) : [];
        if (storedFavorites.includes(itemId)) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error("Error loading favorites from storage:", err);
      }
    };
    loadFavorites();
  }, [itemId, storageKey]);

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
      // Load current favorites
      const data = await getAsyncStorageItem(storageKey);
      let storedFavorites: string[] = data ? JSON.parse(data) : [];

      if (isFavorite) {
        // REMOVE
        storedFavorites = storedFavorites.filter((id) => id !== itemId);
        
        if (isStore) {
          await removeStoreFavorite(itemId, authToken);
          toast.show("Store removed from favorites", { type: "danger" });
        } else {
          await removeFavorite(itemId, authToken);
          toast.show("Removed from favorites", { type: "danger" });
        }
        
        setIsFavorite(false);
      } else {
        // ADD
        storedFavorites.push(itemId);
        
        if (isStore) {
          await addStoreFavorite(itemId, authToken);
          toast.show("Store added to favorites", { type: "success" });
        } else {
          await addFavorite(itemId, authToken);
          toast.show("Added to favorites", { type: "success" });
        }
        
        setIsFavorite(true);
      }

      // Persist update
      await setAsyncStorageItem(storageKey, JSON.stringify(storedFavorites));
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