import React, { FC } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FetchProductDetail } from "../product/fetch-product-type";
import { router } from "expo-router";

interface SellerDetailsProps {
  product: FetchProductDetail;
}

const SellerDetails: FC<SellerDetailsProps> = ({ product }) => {
  const store = product?.store;
  const storeName = store?.name || "Unknown Store";
  const storeSlug = store?.slug || "unknown-store";
  const storeLogo = store?.symbol  || "";
  const storeAddress =
    store?.address?.locality ||
    store?.address?.state ||
    "No address available";
  const contactDetails =
    product?.meta?.contact_details_consumer_care ||
    "Contact information not available";

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() =>
        router.push(`/(tabs)/home/result/productListing/${storeSlug}`)
      }
    >
      {/* Store Logo */}
      {storeLogo ? (
        <Image source={{ uri: storeLogo }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.placeholderLogo]}>
          <Text style={{ fontSize: 10, color: "#888" }}>No Logo</Text>
        </View>
      )}

      {/* Store Info */}
      <View style={styles.textContainer}>
        <Text style={styles.soldByText}>
          Sold by:{" "}
          <Text style={styles.storeNameText} numberOfLines={1}>
            {storeName}
          </Text>
        </Text>
        <Text style={styles.addressText} numberOfLines={1}>
          {storeAddress}
        </Text>
        <Text style={styles.contactText} numberOfLines={1}>
          {contactDetails}
        </Text>
      </View>

      {/* Visit */}
      <Text style={styles.visitText}>›</Text>
    </TouchableOpacity>
  );
};

export default SellerDetails;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#ccc",
    marginRight: 10,
  },
  placeholderLogo: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  soldByText: {
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
  },
  storeNameText: {
    color: "#007bff",
    fontWeight: "700",
  },
  addressText: {
    fontSize: 12,
    color: "#495057",
  },
  contactText: {
    fontSize: 12,
    color: "#868e96",
  },
  visitText: {
    fontSize: 20,
    color: "#adb5bd",
    marginLeft: 8,
    fontWeight: "600",
  },
});
