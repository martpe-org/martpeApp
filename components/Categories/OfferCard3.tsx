import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface OfferCard3Props {
  storeData: any;
}

const OfferCard3: React.FC<OfferCard3Props> = ({ storeData }) => {
  if (!storeData) return null;

  const {
    descriptor = {},
    calculated_max_offer = {},
    slug,
  } = storeData;

  const { name = "", symbol = "", images = [] } = descriptor;
  const bgImg = images?.[0] || symbol || "https://via.placeholder.com/400x200";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardWrapper}
      onPress={() => {
        if (slug) {
          router.push(`/(tabs)/home/result/productListing/${slug}`);
        }
      }}
    >
      {/* Background Image */}
      <Image source={{ uri: bgImg }} style={styles.backgroundImage} />

      {/* Gradient Overlay for readability */}
      <LinearGradient
        colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]}
        style={styles.gradientOverlay}
      />

      {/* Discount Tag - BIG highlight */}
      {calculated_max_offer?.percent > 0 && (
        <View style={styles.discountTag}>
          <Text style={styles.discountText}>
            {Math.round(calculated_max_offer.percent)}% OFF
          </Text>
        </View>
      )}

      {/* Store Info Overlay */}
      <View style={styles.infoContainer}>
        <Text style={styles.storeName} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.locationRow}>
          <MaterialIcons name="local-offer" size={14} color="#fff" />
          <Text style={styles.addressText} numberOfLines={1}>
            Special Offer Store
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OfferCard3;

const styles = StyleSheet.create({
  cardWrapper: {
    width: 260,
    height: 160,
    borderRadius: 18,
    marginRight: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom:10
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  discountTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#E11D48",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 5,
  },
  discountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  infoContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    fontSize: 13,
    marginLeft: 5,
    color: "#f9fafb",
  },
});
