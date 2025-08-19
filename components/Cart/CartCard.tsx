import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import CartItems from "./CartItems";
import { useCartStore } from "../../state/useCartStore";
import useDeliveryStore from "../../state/deliveryAddressStore";
import useUserDetails from "../../hook/useUserDetails";
import { getDistance } from "geolib";
import { FontAwesome } from "@expo/vector-icons";
import {
  FetchCartStore,
  CartItemType,
} from "../../app/(tabs)/cart/fetch-carts-type";
import { 
  getAsyncStorageItem, 
  setAsyncStorageItem 
} from "../../utility/asyncStorage";

const STORAGE_KEY = "addedItems";

interface CartCardProps {
  id: string;
  store: FetchCartStore;
  items: CartItemType[];
  onCartChange?: () => void; // called when cart updates
}

const CartCard: React.FC<CartCardProps> = ({
  id,
  store,
  items,
  onCartChange,
}) => {
  const { removeCart } = useCartStore();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const { userDetails, isLoading: isUserLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const [isRemoving, setIsRemoving] = useState(false);
  const [validItems, setValidItems] = useState<CartItemType[]>([]);
  const [distance, setDistance] = useState<number | null>(null);

  // Helper function to get item slug from different possible locations
  const getItemSlug = (item: CartItemType): string | undefined => {
    return item.slug || 
           item.product?.slug || 
           item.product?.name?.toLowerCase().replace(/\s+/g, '-');
  };

  // Helper function to remove items from AsyncStorage
  const removeFromAsyncStorage = async (slugsToRemove: string[]) => {
    try {
      const data = await getAsyncStorageItem(STORAGE_KEY);
      const storedItems: string[] = data ? JSON.parse(data) : [];
      const updatedItems = storedItems.filter(slug => !slugsToRemove.includes(slug));
      await setAsyncStorageItem(STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error("Error removing from AsyncStorage:", error);
    }
  };

  // ✅ Filter valid items
  useEffect(() => {
    if (!items || !Array.isArray(items)) {
      setValidItems([]);
      return;
    }
    const filtered = items.filter((item) => item && item._id);
    setValidItems(filtered);
  }, [items]);

  // ✅ Calculate distance
  useEffect(() => {
    if (
      !store?.gps?.lat ||
      !store?.gps?.lon ||
      !selectedDetails?.lat ||
      !selectedDetails?.lng
    ) {
      setDistance(null);
      return;
    }

    try {
      const storeLat = Number(store.gps.lat);
      const storeLon = Number(store.gps.lon);
      const userLat = Number(selectedDetails.lat);
      const userLng = Number(selectedDetails.lng);

      if (
        isNaN(storeLat) ||
        isNaN(storeLon) ||
        isNaN(userLat) ||
        isNaN(userLng) ||
        Math.abs(storeLat) > 90 ||
        Math.abs(storeLon) > 180 ||
        Math.abs(userLat) > 90 ||
        Math.abs(userLng) > 180
      ) {
        setDistance(null);
        return;
      }

      const distanceInMeters = getDistance(
        { latitude: storeLat, longitude: storeLon },
        { latitude: userLat, longitude: userLng }
      );
      setDistance(Number((distanceInMeters / 1000).toFixed(1)));
    } catch (error) {
      console.error("CartCard: Error calculating distance:", error);
      setDistance(null);
    }
  }, [store?.gps, selectedDetails]);

  // ✅ Delivery time estimation
  const calculateDeliveryTime = (distanceKm: number) => {
    if (!distanceKm || distanceKm < 0) return "N/A";

    try {
      const avgSpeedKmh = 35; // average speed in km/h
      const timeInHours = distanceKm / avgSpeedKmh;

      if (timeInHours < 1) {
        const minutes = Math.round(timeInHours * 60);
        return minutes <= 0 ? "< 1 min" : `${minutes} min`;
      } else {
        const hours = Math.round(timeInHours);
        return `${hours} hr${hours > 1 ? "s" : ""}`;
      }
    } catch (error) {
      console.error("CartCard: Error calculating delivery time:", error);
      return "N/A";
    }
  };

  // ✅ Remove Cart Handler with AsyncStorage sync
  const handleCloseButton = () => {
    if (isRemoving || !authToken || !store?._id) {
      if (!authToken) {
        Alert.alert("Login Required", "Please login to remove cart.");
      }
      return;
    }

    Alert.alert(
      "Remove Cart",
      `Are you sure you want to remove the cart from "${store.name}" and all its items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsRemoving(true);
            try {
              // Get all slugs from items before removal for AsyncStorage cleanup
              const slugsToRemove: string[] = validItems
                .map(item => getItemSlug(item))
                .filter(Boolean) as string[];

              const success = await removeCart(store._id, authToken);
              if (!success) {
                Alert.alert(
                  "Error",
                  "Failed to remove cart. Please try again."
                );
              } else {
                console.log("Cart removal successful for store:", store._id);
                
                // Remove all items from this cart from AsyncStorage
                if (slugsToRemove.length > 0) {
                  await removeFromAsyncStorage(slugsToRemove);
                }
                
                onCartChange?.(); // refresh parent
              }
            } catch (error) {
              console.error("CartCard: Error deleting the cart", error);
              Alert.alert("Error", "Failed to remove cart. Please try again.");
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ]
    );
  };

  if (!id) {
    return <View />;
  }

  if (!store || !store._id) {
    return <View />;
  }

  // ✅ Show empty state
  if (validItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cart is empty</Text>
        <Text style={styles.emptySubText}>Add items to get started</Text>
      </View>
    );
  }

  const isDisabled = isRemoving || !authToken || isUserLoading;

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.sellerInfoContainer}>
        <View style={styles.sellerLogoContainer}>
          {store.symbol ? (
            <Image
              source={{ uri: store.symbol }}
              style={styles.sellerLogo}
              onError={() =>
                console.warn("CartCard: Failed to load store symbol")
              }
            />
          ) : (
            <View style={[styles.sellerLogo, styles.placeholderLogo]}>
              <FontAwesome name="store" size={24} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName} numberOfLines={2}>
            {store.name || "Unknown Store"}
          </Text>

          {store.address?.street && (
            <Text style={styles.sellerLocation} numberOfLines={2}>
              📍 {store.address.street}
            </Text>
          )}

          {distance !== null && (
            <View style={styles.distanceContainer}>
              <View style={styles.time}>
                <Text style={styles.distanceText}>{distance} km</Text>
                <Text style={styles.separator}> • </Text>
                <Text style={styles.timeText}>
                  ⏱️ {calculateDeliveryTime(distance)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.closeIcon, isDisabled && styles.disabledButton]}
          onPress={handleCloseButton}
          activeOpacity={0.7}
          disabled={isDisabled}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            <FontAwesome
              name="trash-o"
              size={18}
              color={authToken ? "red" : "#ccc"}
              style={styles.trashIconStyle}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      {store.slug ? (
        <CartItems
          cartId={id}
          storeSlug={store.slug}
          items={validItems}
          onCartChange={onCartChange}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            ⚠️ Unable to load cart items (missing store information)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    position: "relative",
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#fff3f3",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ffcccb",
  },
  errorText: {
    fontSize: 14,
    color: "#d73a49",
    textAlign: "center",
    fontWeight: "500",
  },
  sellerInfoContainer: {
    marginBottom: 12,
    flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingBottom: 12,
    alignItems: "flex-start",
  },
  sellerLogoContainer: {
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  sellerLogo: {
    width: 56,
    height: 56,
    borderColor: "#e9ecef",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  placeholderLogo: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  sellerLocation: {
    color: "#666",
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 16,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  separator: {
    color: "#ccc",
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "500",
  },
  closeIcon: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 6,
    minWidth: 40,
    minHeight: 40,
  },
  disabledButton: {
    opacity: 0.5,
  },
  trashIconStyle: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#ffebee",
    borderRadius: 4,
    backgroundColor: "#fafafa",
  },
});

export default CartCard;