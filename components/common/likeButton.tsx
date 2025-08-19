import React, { useRef, useState, useEffect } from "react";
import { Animated, Alert } from "react-native";
import useUserDetails from "../../hook/useUserDetails";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useToast } from "react-native-toast-notifications";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";

interface LikeButtonProps {
  productId: string;
  productData?: any;
  color?: string;
  size?: number;
  showToast?: boolean;
}

const LikeButton = ({ 
  productId, 
  productData,
  color = "#000", 
  size = 24,
  showToast = true
}: LikeButtonProps) => {
  const { authToken } = useUserDetails();
  const { addFavorite, removeFavorite } = useFavoriteStore();

  // Local state for favorites
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation value
  const scaleValue = useRef(new Animated.Value(1)).current;
const toast = useToast();

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const favorites = await getAsyncStorageItem("userFavorites");
      if (favorites && typeof favorites === "string") {
        const parsedFavorites = JSON.parse(favorites) as string[];
        setLocalFavorites(parsedFavorites);
      } else {
        setLocalFavorites([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      setLocalFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (favorites: string[]) => {
    try {
      await setAsyncStorageItem("userFavorites", JSON.stringify(favorites));
      setLocalFavorites(favorites);
    } catch (error) {
      console.error("Error saving favorites:", error);
      throw error;
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.85,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = async () => {
    // Reset animation
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    // Check authentication
    if (!authToken) {
      Alert.alert(
        "Login Required", 
        "Please log in to save favorites.", 
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => console.log("Navigate to login") },
        ]
      );
      return;
    }

    const isCurrentlyFavorite = localFavorites.includes(productId);

    try {
      let updatedFavorites: string[];
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        updatedFavorites = localFavorites.filter(id => id !== productId);
        await saveFavorites(updatedFavorites);
        
        // Sync with store
        try {
          await removeFavorite(productId, authToken);
        } catch (storeError) {
          console.warn("Store sync failed:", storeError);
        }
        
       if (showToast) {
  toast.show("Removed from favorites", {
    type: "danger",
    placement: "bottom",
    duration: 2000,
  });
}

      } else {
        // Add to favorites
        updatedFavorites = [...localFavorites, productId];
        await saveFavorites(updatedFavorites);
        
        // Sync with store
        try {
          await addFavorite(productId, authToken);
        } catch (storeError) {
          console.warn("Store sync failed:", storeError);
        }
        
       if (showToast) {
  toast.show("❤️ Added to favorites", {
    type: "success",
    placement: "bottom",
    duration: 2000,
  });
}

      }

    } catch (error) {
      console.error("Error toggling favorite:", error);
      
      if (showToast) {
        Alert.alert(
          "Error", 
          "Could not update favorites. Please try again.", 
          [{ text: "OK" }]
        );
      }
      
      // Reload favorites to ensure consistency
      await loadFavorites();
    }
  };

  // Check if item is favorites
  const isFavorite = localFavorites.includes(productId);

  // Show loading state
  if (isLoading) {
    return (
      <TouchableOpacity disabled style={{ opacity: 0.6 }}>
        <MaterialCommunityIcons
          name="heart-outline"
          size={size}
          color="#ccc"
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <MaterialCommunityIcons
          name={isFavorite ? "heart" : "heart-outline"}
          size={size}
          color={isFavorite ? "#FB3E44" : color}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default LikeButton;