import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { FC } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "react-native-toast-notifications";
import ImageComp from "../../components/common/ImageComp";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import AddToCart from "../common/AddToCart";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 36) / 2; // two cards + gaps

interface FavItemsProps {
  favorites: any[];
  authToken: string;
}

const FavItems: FC<FavItemsProps> = ({ favorites = [], authToken }) => {
  const { removeFavorite } = useFavoriteStore();
  const router = useRouter();

  if (!favorites.length) {
    return (
      <View style={styles.center}>
        <FontAwesome name="heart-o" size={48} color="#CBD5E0" />
        <Text style={styles.emptyText}>No favorite items yet</Text>
        <Text style={styles.emptySubText}>
          Start shopping and add items to favorites!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      <View style={styles.grid}>
        {[...favorites].reverse().map((item: any, index: number) => {
          const productName =
            item?.descriptor?.name || item?.name || "Unnamed Product";
          const providerName =
            item?.provider?.descriptor?.name || item?.brand || "";
          const imageUrl =
            item?.descriptor?.images?.[0] || item?.images?.[0] || null;
          const price = item.price?.value;
          const maxPrice = item.price?.maximum_value;

          return (
            <TouchableOpacity
              key={item.id || item.slug || `fav-${index}`}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname:
                    "/(tabs)/home/result/productDetails/[productDetails]",
                  params: { productDetails: item.slug },
                })
              }
            >
              {/* Heart Icon */}
              <TouchableOpacity
                style={styles.heartIcon}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking heart
                  if (authToken) {
                    removeFavorite(item.slug, authToken);
                  } else {
                    Toast.show("Authentication required", { type: "error" });
                  }
                }}
              >
                <FontAwesome name="heart" size={18} color="#E53E3E" />
              </TouchableOpacity>

              {/* Product Image */}
              <ImageComp
                source={imageUrl}
                imageStyle={styles.image}
                resizeMode="cover"
              />

              {/* Product Info */}
              <View style={styles.itemInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {productName}
                </Text>
                
                {providerName ? (
                  <Text style={styles.provider} numberOfLines={1}>
                    {providerName}
                  </Text>
                ) : null}

                {/* Bottom Section: Price + Add Button */}
                <View style={styles.bottomSection}>
                  {/* Price */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.newPrice}>₹{price}</Text>
                    {maxPrice > price && (
                      <Text style={styles.oldPrice}>₹{maxPrice}</Text>
                    )}
                  </View>

                  {/* Add Button */}
                  <View style={styles.addButtonContainer}>
                    <AddToCart
                      price={price}
                      storeId={item.store_id}
                      slug={item.slug}
                      catalogId={item.catalog_id}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heartIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: cardWidth * 0.8,
    borderRadius: 10,
    backgroundColor: "#F8F8F8",
    marginBottom: 6,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    lineHeight: 18,
    marginBottom: 2,
  },
  provider: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 'auto',
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  newPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginRight: 6,
  },
  oldPrice: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  addButtonContainer: {
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
  },
});

export default FavItems;