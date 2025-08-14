import React, { FC } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import ShareButton from "../../components/common/Share";
import LikeButton from "../../components/common/likeButton";

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
  const allFavoritesProducts = useFavoriteStore((state) => state.allFavorites);

  // Compute isFavorite for LikeButton
  const isFavorite = allFavoritesProducts?.products?.some(
    (item) => item.id === productId
  );

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
        <LikeButton productId={productId as string} color="#E11D48" />
        <ShareButton
          productId={productId as string}
          productName={itemName}
          storeName={storeName}
          incentivise={true}
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

    // subtle shadow for floating feel
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
