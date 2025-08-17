import React, { useMemo, useState } from "react";
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
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const [isRemoving, setIsRemoving] = useState(false);

  // Validate required props
  if (!id || !store) {
    console.warn("CartCard: Missing required props - id or store");
    return null;
  }

  // Filter valid items
  const validItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.filter((item) => {
      if (!item) {
        console.warn("CartCard: Found null/undefined item, filtering out");
        return false;
      }
      if (!item._id) {
        console.warn("CartCard: Found item without _id, filtering out:", item);
        return false;
      }
      return true;
    });
  }, [items]);

  const storeId = store._id;
  const storeName = store.name || "Unknown Store";
  const storeSymbol = store.symbol;
  const storeAddress = store.address?.street;
  const storeLocation = store.gps;
  const storeSlug = store.slug;

  const distance = useMemo(() => {
    if (
      !storeLocation?.lat || 
      !storeLocation?.lon || 
      !selectedDetails?.lat || 
      !selectedDetails?.lng
    ) {
      return null;
    }

    try {
      const storeLat = Number(storeLocation.lat);
      const storeLon = Number(storeLocation.lon);
      const userLat = Number(selectedDetails.lat);
      const userLng = Number(selectedDetails.lng);

      // Validate coordinates
      if (
        isNaN(storeLat) || isNaN(storeLon) || 
        isNaN(userLat) || isNaN(userLng) ||
        Math.abs(storeLat) > 90 || Math.abs(storeLon) > 180 ||
        Math.abs(userLat) > 90 || Math.abs(userLng) > 180
      ) {
        console.warn("CartCard: Invalid coordinates", {
          store: { lat: storeLat, lon: storeLon },
          user: { lat: userLat, lng: userLng }
        });
        return null;
      }

      const distanceInMeters = getDistance(
        { latitude: storeLat, longitude: storeLon },
        { latitude: userLat, longitude: userLng }
      );
      
      return Number((distanceInMeters / 1000).toFixed(1));
    } catch (error) {
      console.error("CartCard: Error calculating distance:", error);
      return null;
    }
  }, [storeLocation, selectedDetails]);

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
        return `${hours} hr${hours > 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error("CartCard: Error calculating delivery time:", error);
      return "N/A";
    }
  };

  const handleCloseButton = () => {
    if (isRemoving || !authToken || !storeId) return;

    Alert.alert(
      "Remove Cart",
      `Are you sure you want to remove the cart from "${storeName}" and all its items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsRemoving(true);
            try {
              const success = await removeCart(storeId, authToken);
              if (!success) {
                Alert.alert("Error", "Failed to remove cart. Please try again.");
              } else {
                console.log("Cart removal successful for store:", storeId);
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

  // Show empty state if no valid items
  if (validItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cart is empty</Text>
        <Text style={styles.emptySubText}>Add items to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.sellerInfoContainer}>
        <View style={styles.sellerLogoContainer}>
          {storeSymbol ? (
            <Image
              source={{ uri: storeSymbol }}
              style={styles.sellerLogo}
              onError={() => console.warn("CartCard: Failed to load store symbol")}
            />
          ) : (
            <View style={[styles.sellerLogo, styles.placeholderLogo]}>
              <FontAwesome name="store" size={24} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName} numberOfLines={2}>
            {storeName}
          </Text>

          {storeAddress && (
            <Text style={styles.sellerLocation} numberOfLines={2}>
              📍 {storeAddress}
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
          style={[
            styles.closeIcon, 
            (isRemoving || !authToken) && styles.disabledButton
          ]}
          onPress={handleCloseButton}
          activeOpacity={0.7}
          disabled={isRemoving || !authToken}
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
      {storeSlug ? (
        <CartItems
          cartId={id}
          storeSlug={storeSlug}
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
  },
  errorText: {
    fontSize: 14,
    color: "#d73a49",
    textAlign: "center",
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