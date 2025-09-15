import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getDistance } from "geolib";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  CartItemType,
  FetchCartStore,
  FetchCartType,
} from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";
import useDeliveryStore from "../address/deliveryAddressStore";
import CartItems from "./CartItems";

import Loader from "../common/Loader";
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
  // ---- Hooks (always at top; never after a conditional return) ----
  const { removeCart, updateCartOffer, clearCartOffer, appliedOffers } =
    useCartStore();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const { userDetails, isLoading: isUserLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const [isRemoving, setIsRemoving] = useState(false);
  const [validItems, setValidItems] = useState<CartItemType[]>([]);
  const [distance, setDistance] = useState<number | null>(null);

  // Offer state for this cart
  const [appliedOfferId, setAppliedOfferId] = useState<string>("");
  const [offersOpen, setOffersOpen] = useState(false);

  // restore previously applied offer (if any) for this cart
  useEffect(() => {
    const existing = appliedOffers[id]?.offerId;
    if (existing) setAppliedOfferId(existing);
  }, [id, appliedOffers]);

  // filter valid items
  useEffect(() => {
    setValidItems(items?.filter((item) => item && item._id) || []);
  }, [items]);

  // compute distance
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

  // ---- Prices & discount (no hooks below here) ----
  const cartSubtotal = validItems.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );

  const offer = store?.offers?.find((o) => o.offer_id === appliedOfferId);

  // generic & safe discount computation
  const qualifierMin = Number(offer?.qualifier?.min_value ?? 0);
  const meetsMin = cartSubtotal >= qualifierMin;

  let computedDiscount = 0;
  if (offer && meetsMin) {
    const valueType = offer?.benefit?.value_type; // "percentage" | "absolute" | etc.
    const rawPercent = Number(
      (offer as any)?.benefit?.value ?? (offer as any)?.benefit?.percent ?? 0
    );
    const rawFlat = Number(
      (offer as any)?.benefit?.value ?? (offer as any)?.benefit?.value_cap ?? 0
    );
    if (valueType === "percentage") {
      const cap = Number(
        (offer as any)?.benefit?.value_cap ?? Number.POSITIVE_INFINITY
      );
      const pctDiscount = (cartSubtotal * rawPercent) / 100;
      computedDiscount = Math.min(
        pctDiscount,
        Number.isFinite(cap) ? cap : pctDiscount
      );
    } else {
      computedDiscount = rawFlat;
    }
  }

  const discount = Math.max(0, Math.min(computedDiscount, cartSubtotal));
  const cartTotal = Math.max(0, cartSubtotal - discount);

  // sync offer selection to store (keep this effect ABOVE any return)
  useEffect(() => {
    if (appliedOfferId) {
      updateCartOffer(id, appliedOfferId, discount, cartTotal);
    } else {
      clearCartOffer(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedOfferId, cartSubtotal, discount, cartTotal, id]);

  // ---- early returns AFTER all hooks are declared ----
  if (!id || !store?._id) return null;

  // shape cart for offer sheet
  const cartWithOffers: FetchCartType = {
    _id: id,
    store: { ...store, offers: store.offers || [] },
    items: validItems,
    cart_items: [],
    cartItemsCount: validItems.length,
    cartTotalPrice: cartTotal,
  };

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
      console.error("CartCard: Error deleting cart", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
            <Loader />
          ) : (
                <MaterialCommunityIcons name="close" size={18} color="#050505" />

          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Items */}
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

      {/* Offers */}
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

      {/* Totals */}
      <View style={{ marginTop: 8 }}>
        {!!discount && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 14, color: "#28a745" }}>
              Discount {appliedOfferId ? `(${appliedOfferId})` : ""}
            </Text>
            <Text style={{ fontSize: 14, color: "#28a745" }}>
              −₹{discount.toFixed(2)}
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600" }}>Total</Text>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            ₹{cartTotal.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
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
