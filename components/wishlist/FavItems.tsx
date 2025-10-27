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
const cardWidth = (screenWidth - 36) / 2;

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

          // ✅ Determine Veg/Non-Veg
          const vegStatus =
            item?.diet_type ||
            item?.veg_nonveg ||
            item?.isVeg ||
            (productName?.toLowerCase().includes("chicken") ||
            productName?.toLowerCase().includes("mutton") ||
            productName?.toLowerCase().includes("non veg")
              ? "non_veg"
              : "veg");

          const isVeg = vegStatus === "veg";

          // ✅ Customization logic
          const customizable =
            item?.customizable ||
            (item?.directlyLinkedCustomGroupIds &&
              item.directlyLinkedCustomGroupIds.length > 0);

          const directlyLinkedCustomGroupIds =
            item?.directlyLinkedCustomGroupIds || [];

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
                  e.stopPropagation();
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
                <View style={styles.nameRow}>
                  <View
                    style={[
                      styles.vegIndicator,
                      { borderColor: isVeg ? "#008000" : "#FF0000" },
                    ]}
                  >
                    <View
                      style={[
                        styles.vegDot,
                        { backgroundColor: isVeg ? "#008000" : "#FF0000" },
                      ]}
                    />
                  </View>

                  <Text style={styles.productName} numberOfLines={2}>
                    {productName}
                  </Text>
                </View>

                {providerName ? (
                  <Text style={styles.provider} numberOfLines={1}>
                    {providerName}
                  </Text>
                ) : null}

                {/* ✅ Expanded AddToCart full width */}
                <TouchableOpacity
                  style={styles.fullAddContainer}
                  activeOpacity={0.8}
                >
                  <AddToCart
                    price={0} // price removed
                    storeId={item.store_id}
                    slug={item.slug}
                    catalogId={item.catalog_id}
                    customizable={customizable}
                    directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
                    productName={productName}
                  />
                </TouchableOpacity>
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 50,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    lineHeight: 18,
    flexShrink: 1,
  },
  provider: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  fullAddContainer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 6,
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
