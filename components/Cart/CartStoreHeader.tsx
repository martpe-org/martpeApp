import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getDistance } from "geolib";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FetchCartStore, CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";
import useDeliveryStore from "../address/deliveryAddressStore";
import Loader from "../common/Loader";

const STORAGE_KEY = "addedItems";

interface CartStoreHeaderProps {
  store: FetchCartStore;
  validItems: CartItemType[];
  onCartChange?: () => void;
  onStoreStatusChange: (isOpen: boolean) => void;
}

const CartStoreHeader: React.FC<CartStoreHeaderProps> = ({
  store,
  validItems,
  onCartChange,
  onStoreStatusChange,
}) => {
  const { removeCart } = useCartStore();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const { userDetails, isLoading: isUserLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const [isRemoving, setIsRemoving] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Check store operating hours
useEffect(() => {
  const checkStoreStatus = () => {
    if (store?.orderTimings && store.orderTimings.length > 0) {
      const now = new Date();
      let currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

      const todayTiming = store.orderTimings.find(timing => timing.day === currentDay);

      if (todayTiming) {
        const parseTime = (timeStr: string) => {
          try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 100 + minutes;
          } catch (er) {
            return 0;
          }
        };
        
        const openTime = parseTime(todayTiming.time_range.gte);
        const closeTime = parseTime(todayTiming.time_range.lte);

        // REVERSED LOGIC: store is considered open when it’s normally closed
        const storeOpen = !(currentTime >= openTime && currentTime <= closeTime);
        setIsStoreOpen(storeOpen);
        onStoreStatusChange(storeOpen);
      } else {
        // Reverse default as well
        setIsStoreOpen(true);
        onStoreStatusChange(true);
      }
    } else {
      // Reverse default if no timings
      setIsStoreOpen(false);
      onStoreStatusChange(false);
    }
  };

  checkStoreStatus();
}, [store, onStoreStatusChange]);


  // Compute distance
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
    const storeLat = Number(store.gps.lat);
    const storeLon = Number(store.gps.lon);
    const userLat = Number(selectedDetails.lat);
    const userLng = Number(selectedDetails.lng);

    if (
      [storeLat, storeLon, userLat, userLng].some(
        (v) => isNaN(v) || Math.abs(v) > 180
      )
    ) {
      setDistance(null);
      return;
    }

    const meters = getDistance(
      { latitude: storeLat, longitude: storeLon },
      { latitude: userLat, longitude: userLng }
    );
    setDistance(Number((meters / 1000).toFixed(1)));
  }, [store?.gps, selectedDetails]);

  const calculateDeliveryTime = (distanceKm: number) => {
    if (!distanceKm || distanceKm < 0) return "N/A";
    const avgSpeedKmh = 35;
    const timeInMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
    return timeInMinutes < 1 ? "< 1 min" : `${timeInMinutes} min`;
  };

  const handleRemoveCart = async () => {
    if (!authToken || !store?._id) {
      return;
    }

    setIsRemoving(true);
    try {
      const success = await removeCart(store._id, authToken);
      if (!success) {
        return;
      }

      // cleanup local storage of added item slugs
      const data = await getAsyncStorageItem(STORAGE_KEY);
      const storedItems: string[] = data ? JSON.parse(data) : [];
      const updatedItems = storedItems.filter(
        (slug) => !validItems.some((i) => i.slug === slug)
      );
      await setAsyncStorageItem(STORAGE_KEY, JSON.stringify(updatedItems));
      onCartChange?.();
    } catch (error) {
      console.error("CartStoreHeader: Error deleting cart", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.sellerInfoContainer}
      onPress={() =>
        router.push(`/(tabs)/home/result/productListing/${store.slug}`)
      }
      activeOpacity={0.7}
    >
      <View style={styles.sellerLogoContainer}>
        {store?.symbol && (
          <Image
            source={{ uri: store.symbol }}
            style={styles.sellerLogo}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.sellerInfo}>
        <View style={styles.storeNameContainer}>
          <Text style={styles.sellerName} numberOfLines={2}>
            {store.name || "Unknown Store"}
          </Text>
          {!isStoreOpen && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>CLOSED</Text>
            </View>
          )}
        </View>
        
        {store.address?.street && (
          <Text style={styles.sellerLocation} numberOfLines={2}>
            📍 {store.address.street}
          </Text>
        )}

        {distance !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{distance} km</Text>
            <Text style={styles.separator}> • </Text>
            <Text style={styles.timeText}>
              ⏱️ {calculateDeliveryTime(distance)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.closeIcon}
        onPress={handleRemoveCart}
        disabled={isRemoving || !authToken || isUserLoading}
      >
        {isRemoving ? (
          <Loader />
        ) : (
          <MaterialCommunityIcons name="close" size={18} color="#050505" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sellerInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingBottom: 12,
  },
  sellerLogoContainer: { marginRight: 12 },
  sellerLogo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  sellerInfo: { flex: 1 },
  storeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  closedBadge: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  closedBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  sellerLocation: { color: "#666", fontSize: 13, marginBottom: 6 },
  distanceContainer: { flexDirection: "row", alignItems: "center" },
  distanceText: { fontSize: 12, color: "#666", fontWeight: "500" },
  separator: { color: "#ccc", fontSize: 12 },
  timeText: { fontSize: 12, color: "#28a745", fontWeight: "500" },
  closeIcon: { padding: 8, minWidth: 40, minHeight: 40, alignItems: "center" },
});

export default CartStoreHeader;