// app/components/store/RestCards.tsx
import React from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
} from "react-native";
import { getDistance } from "geolib";
import RestCardImageSection from "./RestCardImageSection";
import { Store2 } from "../../hook/fetch-domain-type";

interface RestCardsProps {
  storeData: Store2;
  userLocation: { lat: number; lng: number };
}

const RestCards: React.FC<RestCardsProps> = ({ storeData, userLocation }) => {
  if (!storeData) return null;

  const descriptor = storeData?.descriptor || {};
  const address = storeData?.address || {};
  const geoLocation = storeData?.geoLocation || {};
  const calculated_max_offer = storeData?.calculated_max_offer || {};
  const offers = storeData?.offers || [];
  const products = storeData?.products || [];

  const { name = "" } = descriptor;

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

  const vendorIdString = storeData?.slug || "";
  const normalizedStoreData = {
    id: vendorIdString,
    slug: vendorIdString,
    descriptor: {
      name: descriptor?.name || "Unknown Store",
      symbol: descriptor?.symbol || "",
      images: descriptor?.images || [],
      ...descriptor,
    },
    ...storeData,
        id: vendorIdString,
    slug: vendorIdString,
  };

  const hasOffer =
    (offers && offers.length > 0) ||
    (calculated_max_offer?.percent && calculated_max_offer?.percent > 0);

  const formatAddress = (address: any): string => {
    if (typeof address === "string") return address;
    if (typeof address === "object" && address !== null) {
      const parts = [];
      if (address.locality) parts.push(address.locality);
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      return parts.join(", ") || "Address not available";
    }
    return "Address not available";
  };

  const formattedAddress = formatAddress(address);

  return (
    <SafeAreaView style={styles.cardWrapper}>
      {/* Entire Card Clickable (navigation only here) */}
      <View
        style={{ flex: 1 }}
      >
        {/* 🖼️ Image + Offer + Like + Timer */}
        <RestCardImageSection
          storeData={storeData}
          products={products}
          hasOffer={hasOffer}
          calculated_max_offer={calculated_max_offer}
          vendorIdString={vendorIdString}
          normalizedStoreData={normalizedStoreData}
        />

        {/* 🏪 Store Info */}
        <View style={styles.bannerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>

          {products?.length ? (
            <Text style={styles.categories} numberOfLines={1}>
              {products
                .slice(0, 4)
                .map((p) => p.name)
                .filter(Boolean)
                .join(", ")}
            </Text>
          ) : null}

          <Text style={styles.addressText} numberOfLines={1}>
            {formattedAddress}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.openText}>Open</Text>
            <Text style={styles.distanceText}>{distanceKm} km</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RestCards;

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginVertical: 8,
    marginHorizontal: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
  bannerContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  categories: {
    fontSize: 13,
    color: "#666",
    marginVertical: 2,
  },
  addressText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  openText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22C55E",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
});
