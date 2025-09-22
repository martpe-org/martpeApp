import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { FetchCartStore } from "@/app/(tabs)/cart/fetch-carts-type";

interface CheckoutStoreSectionProps {
  store: FetchCartStore;
}

const CheckoutStoreSection: React.FC<CheckoutStoreSectionProps> = ({ store }) => {
  return (
    <View style={styles.storeSection}>
      <TouchableOpacity
        style={styles.storeHeader}
        onPress={() =>
          router.push(`/(tabs)/home/result/productListing/${store.slug}`)
        }
        activeOpacity={0.7}
      >
        {store?.symbol && (
          <Image
            source={{ uri: store.symbol }}
            style={styles.storeLogo}
            onError={() => console.warn("Failed to load store image")}
          />
        )}
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>
            {store.name || "Unknown Store"}
          </Text>
          {store.address?.street && (
            <Text style={styles.storeAddress}>
              📍 {store.address.street}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  storeSection: {
    backgroundColor: "white",
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: "#666",
  },
});

export default CheckoutStoreSection;