import React, { useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import {
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import LikeButton from "@/components/common/likeButton";
import ShareButton from "@/components/common/Share";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";

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

    // Final fallback
    return "Discover amazing products and great service";
  };

  const descriptionText = getDescriptionText();
  const displayDescription =
    descriptionText.length > 40
      ? descriptionText.slice(0, 40) + "..."
      : descriptionText;
  const vendorIdString = Array.isArray(vendorId) ? vendorId[0] : vendorId;

  return (
    <SafeAreaView
      style={{
        ...styles.PLPBannerCardContainer,
        marginTop: searchbox ? 10 : 50,
        height: searchbox ? 100 : undefined,
      }}
    >
      {/* Title + Info Icon */}
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.PLPBannerCardTitle}>{title}</Text>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={24}
          color="#666"
          style={styles.icon}
        />
      </View>

      {/* Description - Only show if we have meaningful text */}
      {descriptionText !== "Discover amazing products and great service" && (
        <Text
          style={{
            ...styles.PLPBannerCardDescription,
            marginBottom: 5,
          }}
        >
          {displayDescription}
        </Text>
      )}

      {/* Address */}
      <View style={styles.PLPBannerCardContentContainer}>
        <View style={{ padding: 3, backgroundColor: "#e8e8e8" }} />
        <Text
          style={{
            fontSize: 13,
            lineHeight: 16,
            color: "#333",
          }}
          numberOfLines={2}
          ellipsizeMode="clip"
        >
          {address}
        </Text>
      </View>

      {/* Like + Share buttons */}
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "flex-end",
        }}
      >
        <LikeButton
          vendorId={vendorIdString}
          storeData={{
            id: vendorIdString,
            name: title,
            descriptor: { short_desc: descriptionText },
          }}
          color="#E11D48"
        />
        <View style={{ marginHorizontal: 5 }} />
        <ShareButton storeName={title} type="outlet" />
      </View>

      {/* Delivery Info Bar */}
      <View
        style={{
          ...styles.PLPBannerCardContentContainer,
          marginTop: 5,
          ...styles.horizontalBar,
        }}
      >
        <Text style={{ color: "#848080", fontSize: 12, marginHorizontal: 5 }}>
          {" \u25CF"}
        </Text>

        <MaterialCommunityIcons
          name="clock-time-four"
          size={12}
          color="black"
          style={{ marginRight: 3 }}
        />
        <Text style={{ fontSize: 12, fontWeight: "500" }}>{deliveryTime}</Text>
        <Text style={{ color: "#848080", fontSize: 12, marginHorizontal: 5 }}>
          {" \u25CF"}
        </Text>

        <MaterialIcons
          name="delivery-dining"
          size={16}
          color="black"
          style={{ marginRight: 3 }}
        />
        <Text style={{ fontSize: 12, fontWeight: "500" }}>{distance} km</Text>
        <Text style={{ color: "#848080", fontSize: 12, marginHorizontal: 5 }}>
          {" \u25CF"}
        </Text>

        <Text style={{ fontSize: 12, fontWeight: "500" }}>{delivery}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  PLPBannerCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 15,
  },
  PLPBannerCardTitle: {
    fontSize: 20,
    fontWeight: "900",
    margin: 4,
  },
  icon: {
    margin: 4,
    marginTop: 5,
  },
  PLPBannerCardDescription: {
    fontSize: 14,
    color: "#848080",
  },
  horizontalBar: {
    borderBottomWidth: 0.5,
    paddingBottom: 15,
  },
  PLPBannerCardContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default PLPBannerCard;