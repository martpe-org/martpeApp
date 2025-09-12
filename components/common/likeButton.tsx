import React, { useRef, useState } from "react";
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
  productData?: any;
  color?: string;
}

const LikeButton = ({
  productId,
  vendorId,
  storeData,
  productData,
  color = "#000",
}: LikeButtonProps) => {
  const { authToken } = useUserDetails();
  const {
    allFavorites,
    addFavorite,
    removeFavorite,
    addStoreFavorite,
    removeStoreFavorite,
    isUpdating,
  } = useFavoriteStore();
  const toast = useToast();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  const isStore = !!vendorId;
  const itemId = isStore ? vendorId : productId;

  // Check favorite state - handle both id and slug matching
  const isFavorite = React.useMemo(() => {
    if (isStore) {
      const isInFavorites =
        allFavorites?.stores?.some(
          (s) => s.id === itemId || s.slug === itemId
        ) || false;

      return isInFavorites;
    }

    const isInFavorites =
      allFavorites?.products?.some(
        (p) => p.id === itemId || p.slug === itemId
      ) || false;

    return isInFavorites;
  }, [allFavorites, itemId, isStore]);

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

    // Prevent multiple rapid taps
    if (isProcessing || isUpdating) {
      console.log("Already processing, ignoring tap");
      return;
    }

    if (!authToken) {
      Alert.alert("Login Required", "Please login to use favorites.");
      return;
    }

    if (!itemId) {
      console.error("No item ID provided");
      return;
    }

    setIsProcessing(true);

    try {
      if (isFavorite) {
        // REMOVE
        if (isStore) {
          await removeStoreFavorite(itemId, authToken);
          toast.show("Store removed from favorites", { type: "warning" });
        } else {
          await removeFavorite(itemId, authToken);
          toast.show("Removed from favorites", { type: "warning" });
        }
      } else {
        // ADD
        if (isStore && storeData) {
          // Ensure storeData has proper structure
          const normalizedStoreData = {
            id: storeData.id || storeData.slug || itemId,
            slug: storeData.slug || storeData.id || itemId,
            descriptor: {
              name:
                storeData.descriptor?.name || storeData.name || "Unknown Store",
              short_desc:
                storeData.descriptor?.short_desc || storeData.short_desc || "",
              description:
                storeData.descriptor?.description ||
                storeData.description ||
                "",
              images: storeData.descriptor?.images || storeData.images || [],
              symbol: storeData.descriptor?.symbol || storeData.symbol || "",
              ...storeData.descriptor,
            },
            symbol: storeData.symbol || "",
            address: storeData.address || {},
            geoLocation: storeData.geoLocation || {},
            calculated_max_offer: storeData.calculated_max_offer || {},
            ...storeData,
            // Override with normalized values
            id: storeData.id || storeData.slug || itemId,
            slug: storeData.slug || storeData.id || itemId,
          };

          await addStoreFavorite(normalizedStoreData, authToken);
          toast.show("Store added to favorites", { type: "success" });
        } else if (!isStore) {
          // Pass available product data for better optimistic updates


          await addFavorite(itemId, authToken);
          toast.show("Added to favorites", { type: "success" });
        } else {
          toast.show("Error: Missing store data", { type: "danger" });
        }
      }
    } catch (err) {
      toast.show("Error updating favorites", { type: "danger" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isProcessing || isUpdating}
      style={{ opacity: isProcessing || isUpdating ? 0.7 : 1 }}
    >
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
