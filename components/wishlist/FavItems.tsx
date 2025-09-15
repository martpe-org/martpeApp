import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { FC } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "react-native-toast-notifications";
import ImageComp from "../../components/common/ImageComp";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import AddToCart from "../common/AddToCart";

const { width: screenWidth } = Dimensions.get("screen");

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
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {[...favorites].reverse().map((item: any, index: number) => {
        const productName =
          item?.descriptor?.name || item?.name || "Unnamed Product";
        const providerName =
          item?.provider?.descriptor?.name || item?.brand || "Unknown Brand";
        const imageUrl =
          item?.descriptor?.images?.[0] || item?.images?.[0] || null;

        return (
          <View
            key={item.id || item.slug || `fav-${index}`}
            style={styles.itemCard}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.favoriteIndicator}>
                <FontAwesome name="heart" size={16} color="#E53E3E" />
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (authToken) {
                    removeFavorite(item.slug, authToken);
                  } else {
                    Toast.show("Authentication required", { type: "error" });
                  }
                }}
              >
                <MaterialCommunityIcons name="close" size={18} color="#050505" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <TouchableOpacity
              style={styles.cardContent}
              onPress={() =>
                router.push({
                  pathname:
                    "/(tabs)/home/result/productDetails/[productDetails]",
                  params: { productDetails: item.slug },
                })
              }
              activeOpacity={0.8}
            >
              {/* Product Image + AddToCart */}
              <View style={styles.imageContainer}>
                <ImageComp
                  source={imageUrl}
                  imageStyle={styles.productImage}
                  resizeMode="contain"
                />
              </View>

              {/* Product Info */}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {productName}
                </Text>
                <Text style={styles.providerName} numberOfLines={1}>
                  {providerName}
                </Text>

                {/* Price Row */}
                <View style={styles.priceRow}>
                  {item.price?.maximum_value > item.price?.value && (
                    <Text style={styles.oldPrice}>
                      ₹ {item.price?.maximum_value}
                    </Text>
                  )}
                  <Text style={styles.newPrice}>₹ {item.price?.value}</Text>
                  {item.price?.offer_percent && (
                    <Text style={styles.discount}>
                      {Math.ceil(item.price.offer_percent)}% off
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ justifyContent: "flex-end" }}>
                <AddToCart
                  price={item.price?.value}
                  storeId={item.store_id}
                  slug={item.slug}
                  catalogId={item.catalog_id}
                />
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  favoriteIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FED7D7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  imageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A202C",
    lineHeight: 22,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 13,
    color: "#607274",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  oldPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: "#607274",
    marginRight: 6,
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  discount: {
    fontSize: 12,
    fontWeight: "500",
    color: "green",
    marginLeft: 6,
  },
  itemBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    color: "#4A5568",
    fontWeight: "500",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FAFAFA",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },
});

export default FavItems;
