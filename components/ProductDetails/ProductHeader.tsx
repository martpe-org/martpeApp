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

  // Directly compute isFavorite without extra state/effect
  const isFavorite = allFavoritesProducts?.products?.some(
    (item) => item.id === productId
  );

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          {itemName.length > 50 ? itemName.slice(0, 50) + "..." : itemName}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Text style={styles.subtitle}>{category}</Text>

          {category === "Grocery" && quantity && unit && (
            <Text style={styles.subtitle}>
              {quantity}{" "}
              {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <LikeButton productId={productId as string} isFavorite={isFavorite} />
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
    height: 50,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    width: width * 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#495057",
    marginRight: width * 0.02,
  },
});
