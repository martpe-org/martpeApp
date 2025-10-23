import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from "react-native";
import {
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";
import { StoreTimings } from "./StoreTimings";
import { StoreBannerInfo } from "./StoreBannerInfo";

interface PLPBannerCardProps {
  title: string;
  description?: string;
  address: string;
  distance: number; // distance in meters
  delivery: string;
  deliveryTime: string;
  searchbox?: boolean;
  userAddress: string;
  vendorId: string | string[];
  store?: FetchStoreDetailsResponseType;
}

const PLPBannerCard: React.FC<PLPBannerCardProps> = ({
  title,
  vendorId,
  description,
  address,
  deliveryTime,
  distance,
  delivery,
  searchbox,
  userAddress,
  store,
}) => {
  const vendorIdString = Array.isArray(vendorId) ? vendorId[0] : vendorId;

  // Format categories
  const getDescriptionText = () => {
    if (store?.store_sub_categories?.length) {
      const categories = store.store_sub_categories.slice(0, 3).join(", ");
      return categories.charAt(0).toUpperCase() + categories.slice(1);
    }
    return null;
  };
  const descriptionText = getDescriptionText();

  // Format address
  const formattedAddress = [
    store?.address?.street,
    store?.address?.street !== store?.address?.locality
      ? store?.address?.locality
      : null,
    store?.address?.city,
    store?.address?.state,
    store?.address?.area_code,
  ]
    .filter(Boolean)
    .join(", ");

const formattedDistance =
   distance != null ? distance.toFixed(1) + " km" : "N/A";

let formattedDeliveryTime = "-";

if (store?.avg_tts_in_h != null && store.avg_tts_in_h > 0) {
  const totalMinutes = store.avg_tts_in_h * 60;

  if (totalMinutes < 60) {
    // Show in minutes if less than 1 hour
    formattedDeliveryTime = `${Math.round(totalMinutes)} min`;
  } else {
    // Convert to hours, show max 1 decimal if needed
    const hours = totalMinutes / 60;
    const roundedHours =
      hours % 1 < 0.25
        ? Math.floor(hours)
        : hours % 1 > 0.75
        ? Math.ceil(hours)
        : Math.round(hours * 2) / 2; // rounds to nearest 0.5
    formattedDeliveryTime = `${roundedHours} hr${roundedHours > 1 ? "s" : ""}`;
  }
} else if (deliveryTime) {
  // fallback to distance-based estimation
  formattedDeliveryTime = deliveryTime;
}



  return (
    <SafeAreaView
      style={{
        ...styles.PLPBannerCardContainer,
        marginTop: searchbox ? 10 : 70,
      }}
    >
      {/* Store Name Row */}
      <View style={styles.titleRow}>
        <Text style={styles.PLPBannerCardTitle}>{title}</Text>
        <StoreBannerInfo store={store} />
      </View>

      {/* Description - Categories */}
      {descriptionText && (
        <Text style={styles.categoryText}>{descriptionText}</Text>
      )}

      {/* Address */}
      <Text style={styles.addressText}>{formattedAddress || address}</Text>

      {/* Info Row - Timings, Distance */}
      <View style={styles.infoRow}>
        {store && <StoreTimings store={store} />}

        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="truck-outline"
            size={22}
            color="#836f6f"
          />
          <Text style={styles.infoText}>{formattedDistance}</Text>
        </View>

        <View style={styles.infoItem}>
          <Entypo name="stopwatch" size={18} color="black" />
          <Text style={styles.infoText}>{formattedDeliveryTime}</Text>
        </View>
      </View>

      {/* Preserve commented code */}
      {/* <View style={styles.bottomRow}>
        <View style={styles.actionButtons}>
          <LikeButton
            vendorId={vendorIdString}
            storeData={{
              id: vendorIdString,
              name: title,
              descriptor: { short_desc: descriptionText || "" },
            }}
            color="#E11D48"
          />
          <View style={{ marginHorizontal: 8 }} />
          <ShareButton storeName={title} type="outlet" />
        </View>
        <Text style={styles.deliveryText}>{delivery}</Text>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  PLPBannerCardContainer: {
    backgroundColor: "#fff",
    padding: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  PLPBannerCardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    marginTop: 2,
  },
  categoryText: {
    fontSize: 13,
    color: "#df4c4c",
    marginBottom: 2,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginTop: -4,
  },
  addressText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 14,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
    marginLeft: 4,
  },
});

export default PLPBannerCard;
