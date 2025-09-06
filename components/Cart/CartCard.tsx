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
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { getDistance } from "geolib";

import CartItems from "./CartItems";
import { useCartStore } from "../../state/useCartStore";
import useDeliveryStore from "../../state/deliveryAddressStore";
import useUserDetails from "../../hook/useUserDetails";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";
import {
  FetchCartStore,
  CartItemType,
  FetchCartType,
} from "../../app/(tabs)/cart/fetch-carts-type";

// 🆕 import your Offer button
import CartOfferBtn from "./CartOfferBtn";

const STORAGE_KEY = "addedItems";

interface CartCardProps {
  id: string;
  store: FetchCartStore;
  items: CartItemType[];
  onCartChange?: () => void;
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

  // 🆕 state for offers
  const [appliedOfferId, setAppliedOfferId] = useState<string>("");
  const [offersOpen, setOffersOpen] = useState(false);

  // ✅ Filter items that have an id
  useEffect(() => {
    setValidItems(items?.filter((item) => item && item._id) || []);
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

    const storeLat = Number(store.gps.lat);
    const storeLon = Number(store.gps.lon);
    const userLat = Number(selectedDetails.lat);
    const userLng = Number(selectedDetails.lng);

    if (
      [storeLat, storeLon, userLat, userLng].some(
        (val) => isNaN(val) || Math.abs(val) > 180
      )
    ) {
      setDistance(null);
      return;
    }

    const distanceInMeters = getDistance(
      { latitude: storeLat, longitude: storeLon },
      { latitude: userLat, longitude: userLng }
    );
    setDistance(Number((distanceInMeters / 1000).toFixed(1)));
  }, [store?.gps, selectedDetails]);

  const calculateDeliveryTime = (distanceKm: number) => {
    if (!distanceKm || distanceKm < 0) return "N/A";
    const avgSpeedKmh = 35;
    const timeInMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
    return timeInMinutes < 1 ? "< 1 min" : `${timeInMinutes} min`;
  };

  // ✅ Remove cart
  const handleRemoveCart = () => {
    if (!authToken || !store?._id) {
      Alert.alert("Login Required", "Please login to remove cart.");
      return;
    }

    Alert.alert(
      "Remove Cart",
      `Are you sure you want to remove the cart from "${store.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsRemoving(true);
            try {
              const success = await removeCart(store._id, authToken);
              if (!success) {
                Alert.alert(
                  "Error",
                  "Failed to remove cart. Please try again."
                );
                return;
              }

              // Cleanup local storage
              const data = await getAsyncStorageItem(STORAGE_KEY);
              const storedItems: string[] = data ? JSON.parse(data) : [];
              const updatedItems = storedItems.filter(
                (slug) => !validItems.some((i) => i.slug === slug)
              );
              await setAsyncStorageItem(
                STORAGE_KEY,
                JSON.stringify(updatedItems)
              );

              onCartChange?.();
            } catch (error) {
              console.error("CartCard: Error deleting cart", error);
              Alert.alert("Error", "Something went wrong.");
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ]
    );
  };

  if (!id || !store?._id) return null;
  if (validItems.length === 0)
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cart is empty</Text>
        <Text style={styles.emptySubText}>Add items to get started</Text>
      </View>
    );

  // 🆕 Build a cart object with offers (like FetchCartType)
  const cartWithOffers: FetchCartType = {
    _id: id,
    store: {
      ...store,
      offers: store.offers || [], // ensure offers exist
    },
    items: validItems,
    cart_items: [],
    cartItemsCount: validItems.length,
    cartTotalPrice: validItems.reduce(
      (sum, item) => sum + (item.total_price || 0),
      0
    ),
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push(`/(tabs)/home/result/productListing/${store.slug}`)
      }
      activeOpacity={0.7}
    >
      {/* Store Header */}
      <View style={styles.sellerInfoContainer}>
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
            <ActivityIndicator size="small" color="red" />
          ) : (
            <FontAwesome
              name="trash-o"
              size={18}
              color={authToken ? "red" : "#ccc"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      {store.slug ? (
        <CartItems
          cartId={id}
          storeId={store._id}
          storeSlug={store.slug}
          items={validItems}
          onCartChange={onCartChange}
        />
      ) : (
        <Text style={styles.errorText}>⚠️ Unable to load cart items</Text>
      )}

      {/* 🆕 Offers Section */}
      {store.offers && store.offers.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <CartOfferBtn
            appliedOfferId={appliedOfferId}
            applyOffer={setAppliedOfferId}
            cart={cartWithOffers}
            offersOpen={offersOpen}
            setOffersOpen={setOffersOpen}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: { fontSize: 16, color: "#666", fontWeight: "500" },
  emptySubText: { fontSize: 14, color: "#999" },
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
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  sellerLocation: { color: "#666", fontSize: 13, marginBottom: 6 },
  distanceContainer: { flexDirection: "row", alignItems: "center" },
  distanceText: { fontSize: 12, color: "#666", fontWeight: "500" },
  separator: { color: "#ccc", fontSize: 12 },
  timeText: { fontSize: 12, color: "#28a745", fontWeight: "500" },
  closeIcon: { padding: 8, minWidth: 40, minHeight: 40, alignItems: "center" },
  errorText: { color: "#d73a49", textAlign: "center", marginTop: 8 },
});

export default CartCard;
