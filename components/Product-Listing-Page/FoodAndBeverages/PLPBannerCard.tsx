import React from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from "react-native";
import {
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import LikeButton from "@/components/common/likeButton";
import ShareButton from "@/components/common/Share";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";
import { StoreTimings } from "./StoreTimings";
import { StoreBannerInfo } from "./StoreBannerInfo";

interface PLPBannerCardProps {
  title: string;
  description?: string;
  address: string;
  deliveryTime: string;
  distance: number;
  delivery: string;
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

  const getDescriptionText = () => {
    if (store?.store_sub_categories?.length) {
      const categories = store.store_sub_categories.slice(0, 3).join(", ");
      return categories.charAt(0).toUpperCase() + categories.slice(1);
    }
    return null;
  };

  const descriptionText = getDescriptionText();
  const vendorIdString = Array.isArray(vendorId) ? vendorId[0] : vendorId;

  // Format address like the image
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

  return (
    <SafeAreaView
      style={{
        ...styles.PLPBannerCardContainer,
        marginTop: searchbox ? 10 : 50,
      }}
    >
      {/* Store Name Row */}
      <View style={styles.titleRow}>
        <Text style={styles.PLPBannerCardTitle}>{title}</Text>
        {/* Info Icon that opens modal */}
        <StoreBannerInfo store={store} />
      </View>
      {/* Description - Categories */}
      {descriptionText && (
        <Text style={styles.categoryText}>
          {descriptionText}
        </Text>
      )}
      {/* Address */}
      <Text style={styles.addressText}>
        {formattedAddress || address}
      </Text>
      {/* Info Row - Open Now, Distance, Time */}
      <View style={styles.infoRow}>
        {/* Store Timings */}
        {store && <StoreTimings store={store} />}
        {/* Distance with icon */}
        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="truck-outline"
            size={22}
            color="#836f6f"
          />
          <Text style={styles.infoText}>{distance} km</Text>
        </View>
        {/* Delivery Time with icon */}
        <View style={styles.infoItem}>
          <Entypo name="stopwatch" size={18} color="black" />
          <Text style={styles.infoText}>{deliveryTime}</Text>
        </View>
      </View>
      {/* Bottom Action Row */}
      {/* <View style={styles.bottomRow}> */}
      {/* <View style={styles.actionButtons}> */}
      {/* <LikeButton
            vendorId={vendorIdString}
            storeData={{
              id: vendorIdString,
              name: title,
              descriptor: { short_desc: descriptionText || "" },
            }}
            color="#E11D48"
          /> */}
      {/* <View style={{ marginHorizontal: 8 }} /> */}
      {/* <ShareButton storeName={title} type="outlet" /> */}
      {/* </View> */}
      {/* Free Delivery - Simple text like in the image */}
      {/* <Text style={styles.deliveryText}>{delivery}</Text> */}
      {/* </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  PLPBannerCardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 12,
    paddingBottom: 8,
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
    marginTop:2
  },
  categoryText: {
    fontSize: 13,
    color: "#df4c4c",
    marginBottom: 2,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginTop:-4

  },
  addressText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 14,
    marginTop:4
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
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e5e5",
    paddingTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
  },
});

export default PLPBannerCard;