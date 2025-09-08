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
  productData?: any; // Add productData prop
  color?: string;
}

const LikeButton = ({ 
  productId, 
  vendorId, 
  storeData, 
  productData, 
  color = "#000" 
}: LikeButtonProps) => {
  const { authToken } = useUserDetails();
  const { 
    allFavorites, 
    addFavorite, 
    removeFavorite, 
    addStoreFavorite, 
    removeStoreFavorite, 
    isUpdating 
  } = useFavoriteStore();
  const toast = useToast();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  const isStore = !!vendorId;
  const itemId = isStore ? vendorId : productId;

  // 🔑 Derive favorite state from Zustand - check both id and slug
  const isFavorite = React.useMemo(() => {
    if (isStore) {
      return allFavorites?.stores?.some((s) => 
        s.id === itemId || s.slug === itemId
      ) || false;
    }
    return allFavorites?.products?.some((p) => 
      p.id === itemId || p.slug === itemId
    ) || false;
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
              name: storeData.descriptor?.name || storeData.name || "Unknown Store",
              short_desc: storeData.descriptor?.short_desc || storeData.short_desc || "",
              description: storeData.descriptor?.description || storeData.description || "",
              ...storeData.descriptor,
            },
            symbol: storeData.symbol || "",
            ...storeData,
          };
          
          await addStoreFavorite(normalizedStoreData, authToken);
          toast.show("Store added to favorites", { type: "success" });
        } else if (!isStore) {
          // Pass available product data for better optimistic updates
          const normalizedProductData = productData ? {
            id: productData.id || productData.slug || itemId,
            slug: productData.slug || productData.id || itemId,
            descriptor: {
              name: productData.descriptor?.name || productData.name || "Unknown Product",
              images: productData.descriptor?.images || productData.images || [],
              ...productData.descriptor,
            },
            price: productData.price || {},
            provider: productData.provider || {},
            store_id: productData.store_id,
            catalog_id: productData.catalog_id,
            ...productData,
          } : undefined;
          
          await addFavorite(itemId, authToken, normalizedProductData);
          toast.show("Added to favorites", { type: "success" });
        } else {
          console.error("Missing storeData for store favorite");
          toast.show("Error: Missing store data", { type: "danger" });
        }
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
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