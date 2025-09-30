import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {  useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FetchCartStore, CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";
import Loader from "../common/Loader";

const STORAGE_KEY = "addedItems";

interface CartStoreHeaderProps {
  store: FetchCartStore;
  validItems: CartItemType[];
  onCartChange?: () => void;
}

const CartStoreHeader: React.FC<CartStoreHeaderProps> = ({
  store,
  validItems,
  onCartChange,
}) => {
  const { removeCart } = useCartStore();
  const { userDetails, isLoading: isUserLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const [isRemoving, setIsRemoving] = useState(false);
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
      console.error("CartStoreHeader: Error deleting cart", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
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
        <View style={styles.storeNameContainer}>
          <Text style={styles.sellerName} numberOfLines={2}>
            {store.name || "Unknown Store"}
          </Text>

        </View>
        {store.address?.street && (
          <Text style={styles.sellerLocation} numberOfLines={1}>
            📍 {store.address.street}
          </Text>
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
  );
};

const styles = StyleSheet.create({
  sellerInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    padding:5,
    borderColor: "#f0f0f0",
  },
  sellerLogoContainer: { marginRight: 12,  },
  sellerLogo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  sellerInfo: { flex: 1 },
  storeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  sellerLocation: { color: "#666", fontSize: 13, marginBottom: 6 },
  distanceContainer: { flexDirection: "row", alignItems: "center" },
  distanceText: { fontSize: 12, color: "#666", fontWeight: "500" },
  separator: { color: "#ccc", fontSize: 12 },
  timeText: { fontSize: 12, color: "#28a745", fontWeight: "500" },
  closeIcon: { padding: 8, minWidth: 40, minHeight: 40, alignItems: "center" },
});

export default CartStoreHeader;