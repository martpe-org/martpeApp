import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import LikeButton from "../../../components/common/likeButton";
import ShareButton from "../../../components/common/Share";

interface PLPBannerCardProps {
  title: string;
  description: string;
  rating: number;
  address: string;
  deliveryTime: string;
  distance: number;
  delivery: string;
  searchbox?: boolean;
  userAddress?: string;
  productId: string;
}

const PLPBannerCard: React.FC<PLPBannerCardProps> = ({
  title,
  description,
  rating,
  address,
  deliveryTime,
  distance,
  delivery,
  searchbox = false,
  userAddress = "",
  productId,
}) => {
  return (
    <View
      style={[
        styles.PLPBannerCardContainer,
        { marginTop: searchbox ? 50 : 125, height: searchbox ? 80 : undefined },
      ]}
    >
      <Text style={styles.PLPBannerCardTitle}>{title}</Text>
      <Text style={styles.PLPBannerCardDescription}>
        {description.length > 40 ? description.slice(0, 40) + "..." : description}
      </Text>

      {/* Horizontal details bar */}
      <View style={[styles.PLPBannerCardContentContainer, styles.horizontalBar]}>
        <FontAwesome name="star" size={12} color="#fbbf24" style={styles.icon} />
        <Text style={styles.smallText}>{rating}</Text>
        <Text style={styles.dot}>{" \u25CF"}</Text>

        <MaterialCommunityIcons
          name="clock-time-four"
          size={12}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.smallText}>{deliveryTime}</Text>
        <Text style={styles.dot}>{" \u25CF"}</Text>

        <MaterialIcons
          name="delivery-dining"
          size={16}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.smallText}>{distance} km</Text>
        <Text style={styles.dot}>{" \u25CF"}</Text>

        <Text style={styles.smallText}>{delivery}</Text>
      </View>

      {/* From address */}
      <View style={[styles.PLPBannerCardContentContainer, { marginTop: 15 }]}>
        <View style={styles.iconBackground}>
          <MaterialIcons name="location-pin" size={14} color="black" />
        </View>
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
          {address}
        </Text>
      </View>

      {/* To address */}
      <View style={[styles.PLPBannerCardContentContainer, { marginTop: 10 }]}>
        <View style={styles.iconBackground}>
          <MaterialIcons name="my-location" size={14} color="black" />
        </View>
        <TouchableOpacity
          style={[styles.PLPBannerCardContentContainer, { flex: 1, justifyContent: "space-between" }]}
          onPress={() => router.push("./address/SavedAddresses")}
        >
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
            {userAddress || "Select location"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="black" />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={[styles.PLPBannerCardContentContainer, { justifyContent: "flex-end" }]}>
        <LikeButton productId={productId} />
        <View style={{ width: 5 }} />
        <ShareButton storeName={title} type="outlet" incentivise={true} storeId={productId} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  PLPBannerCardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginHorizontal: 15,
    overflow: "hidden",
    padding: 20,
    elevation: 3,
  },
  PLPBannerCardTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  PLPBannerCardDescription: {
    fontSize: 14,
    color: "#848080",
    marginBottom: 5,
  },
  horizontalBar: {
    borderBottomWidth: 0.5,
    paddingBottom: 15,
    borderColor: "#C6C6C6",
    marginTop: 5,
  },
  PLPBannerCardContentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBackground: {
    padding: 3,
    backgroundColor: "#e8e8e8",
    borderRadius: 100,
  },
  addressText: {
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
    lineHeight: 14,
    color: "#848080",
  },
  smallText: {
    fontSize: 12,
    fontWeight: "500",
  },
  icon: {
    marginRight: 3,
  },
  dot: {
    color: "#848080",
    fontSize: 12,
    marginHorizontal: 5,
  },
});

export default PLPBannerCard;
