import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LikeButton from "../../components/common/likeButton";
import { getDistance } from "geolib";
import OfferBadge from "../common/OfferBadge";
import { Store2 } from "../../hook/fetch-domain-type";

interface StoreCard3Props {
  storeData: Store2;
  userLocation: { lat: number; lng: number };
}

const StoreCard3: React.FC<StoreCard3Props> = ({ storeData, userLocation }) => {
  if (!storeData) return null;

  const descriptor = storeData?.descriptor || {};
  const address = storeData?.address || {};
  const geoLocation = storeData?.geoLocation || {};
  const calculated_max_offer = storeData?.calculated_max_offer || {};
  const offers = storeData?.offers || [];
  const products = storeData?.products || [];
  const categories = storeData?.categories || storeData?.tags || [];

  const { name = "", symbol = "", images = [] } = descriptor;

  const bgImg = images?.[0] || symbol || "https://via.placeholder.com/400x200";

  // Calculate distance safely
  const distanceKm = geoLocation?.lat
    ? Number(
      (
        getDistance(
          { latitude: geoLocation.lat, longitude: geoLocation.lng },
          {
            latitude: userLocation?.lat || 0,
            longitude: userLocation?.lng || 0,
          }
        ) / 1000
      ).toFixed(1)
    )
    : 0;

  // Fix: Use consistent vendorId - prioritize slug, then id
  const vendorIdString = storeData?.slug || "";
  // Fix: Create properly structured store data for LikeButton
  const normalizedStoreData = {
    id: vendorIdString,
    slug: vendorIdString,
    descriptor: {
      name: descriptor?.name || name || "Unknown Store",
      short_desc: descriptor?.short_desc || "",
      description: descriptor?.description || "",
      images: descriptor?.images || images || [],
      symbol: descriptor?.symbol || symbol || "",
      ...descriptor,
    },
    ...storeData,
    id: vendorIdString,
    slug: vendorIdString,
  };

  // Famous product info
  const firstProduct = products?.[0];
  const productName = firstProduct?.name || "";
  const productPrice =
    firstProduct?.price?.value ||
    firstProduct?.price?.default_selection?.value ||
    firstProduct?.price?.range?.lower ||
    firstProduct?.priceRangeDefault ||
    null;

  const famousProducts = products
    ?.slice(0, 5)
    ?.map((p) => p?.name)
    .filter(Boolean)
    .join(", ");

  // Check if offer exists
  const hasOffer =
    (offers && offers.length > 0) ||
    (calculated_max_offer?.percent && calculated_max_offer?.percent > 0);

  // Format categories like in FavOutlets
  const formatCategories = (categories: any[]): string => {
    if (!categories || !Array.isArray(categories)) return "Various categories";
    const categoryNames = categories
      .map((cat) => {
        if (typeof cat === "string") return cat;
        if (cat?.name) return cat.name;
        if (cat?.descriptor?.name) return cat.descriptor.name;
        if (cat?.id) return cat.id;
        return null;
      })
      .filter(Boolean);
    return categoryNames.length > 0
      ? categoryNames.join(", ")
      : "Various categories";
  };

  // Format address like in FavOutlets
  const formatAddress = (address: any): string => {
    if (typeof address === "string") return address;
    if (typeof address === "object" && address !== null) {
      const parts = [];
      if (address.locality) parts.push(address.locality);
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.area_code) parts.push(address.area_code);
      return parts.length > 0 ? parts.join(", ") : "Address not available";
    }
    return "Address not available";
  };

  const categoryText = formatCategories(categories);
  const formattedAddress = formatAddress(address);

  return (
    <SafeAreaView style={styles.cardWrapper}>
      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        <TouchableOpacity
          onPress={() => {
            if (storeData.slug) {
              router.push(`/(tabs)/home/result/productListing/${storeData.slug}`);
            }
          }}
        >
          <Image
            source={{ uri: bgImg }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          {/* Overlay product name + price */}
          {productName && (
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayText} numberOfLines={1}>
                {productName}
                {productPrice ? ` - ₹${Number(productPrice).toFixed(2)}` : ""}
              </Text>
            </View>
          )}

          {/* Offer Badge (only if offers exist) */}
          {hasOffer && (
            <OfferBadge
              offers={offers}
              maxStoreItemOfferPercent={
                calculated_max_offer?.percent > 0
                  ? Math.round(calculated_max_offer.percent)
                  : undefined
              }
            />
          )}

          {/* Time Badge */}
          <View style={styles.timeBadge}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
            <Text style={styles.timeBadgeText}>30 mins</Text>
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <View style={styles.topActions}>
          <LikeButton
            vendorId={vendorIdString}
            storeData={normalizedStoreData}
            color="#E11D48"
          />
        </View>
      </View>

      {/* Divider */}
      <View style={styles.dividerLine} />

      {/* Store Info */}
      <View style={styles.bannerContent}>
        {/* Store Name */}
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>

        {/* Categories - Added this section */}
        {categoryText && (
          <Text style={styles.categories} numberOfLines={1}>
            {categoryText}
          </Text>
        )}

        {/* Famous Products */}
        {famousProducts ? (
          <Text style={styles.famousProducts} numberOfLines={1}>
            {famousProducts}
          </Text>
        ) : null}

        {/* Address */}
        <Text style={styles.addressText} numberOfLines={2}>
          {formattedAddress}
        </Text>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.openStatus}>
            <View style={styles.openDot} />
            <Text style={styles.openText}>Open</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{distanceKm} km</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StoreCard3;

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 1,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 0.5,
    borderColor: "#eee",
    marginBottom: 10,
    overflow: "hidden",
  },
  bannerContainer: {
    position: "relative",
    backgroundColor: "#fff",
  },
  backgroundImage: {
    width: "100%",
    height: 160,
  },
  overlayContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  overlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  topActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  timeBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(34,197,94,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    elevation: 3,
  },
  timeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 10,
  },
  bannerContent: {
    backgroundColor: "#fff",
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  categories: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 4,
    lineHeight: 18,
  },
  famousProducts: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  openStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  openDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#27b45b",
    marginRight: 6,
  },
  openText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#22C55E",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});