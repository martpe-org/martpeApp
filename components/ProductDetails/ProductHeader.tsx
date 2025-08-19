import React, { FC, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import ShareButton from "../../components/common/Share";
import LikeButton from "../../components/common/likeButton";
import useLocalFavorites from "../../hook/useLocalFavorites";
import { getAsyncStorageItem, setAsyncStorageItem } from "../../utility/asyncStorage";

interface ProductHeaderProps {
  itemName: string;
  category: string;
  productId: string | string[];
  storeName: string;
  quantity?: number;
  unit?: string;
}

const { width } = Dimensions.get("window");

const ProductHeader: FC<ProductHeaderProps> = ({
  itemName,
  category,
  storeName,
  productId,
  quantity,
  unit,
}) => {
  const { isFavorite, getFavoriteCount } = useLocalFavorites();

  // Ensure productId is a string
  const productIdString = Array.isArray(productId) ? productId[0] : productId;

  // Debug auth token setup
  useEffect(() => {
    const debugAuth = async () => {
      const token = await getAsyncStorageItem("authToken");
      if (!token) {
        await setAsyncStorageItem("authToken", "test-auth-token-123");
      }
    };
    debugAuth();
  }, []);

  // Check if item is favorite
  const isLocalFavorite = isFavorite(productIdString);

  console.log("ProductHeader Debug:", {
    productId: productIdString,
    isLocalFavorite,
    localFavoritesCount: getFavoriteCount(),
  });

  // Data to store with favorite
  const productData = {
    name: itemName,
    category,
    storeName,
    quantity,
    unit,
  };

  return (
    <View style={styles.container}>
      {/* Left: Product Name + Category */}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {itemName}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.subtitle}>{category}</Text>
          {category === "Grocery" && quantity && unit && (
            <Text style={styles.subtitle}>
              {quantity} {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </Text>
          )}
        </View>
      </View>

      {/* Right: Like + Share */}
      <View style={styles.actions}>
        <LikeButton
          productId={productIdString}
          productData={productData}
          color="#E11D48"
          size={24}
          showToast={true}
        />
        <ShareButton
          productId={productIdString}
          productName={itemName}
          storeName={storeName}
          type="item"
        />
      </View>
    </View>
  );
};

export default ProductHeader;

const styles = StyleSheet.create({
  container: {
    width: width,
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2c4372",
    marginBottom: width * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    maxWidth: width * 0.55,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: width * 0.02,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});
