import { router } from "expo-router";
import React, { FC } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import ImageComp from "../common/ImageComp";
import LikeButton from "../common/likeButton";
import AddToCart from "../common/AddToCart";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ProductSearchResult } from "../search/search-products-type";

const { width } = Dimensions.get("window");

// Helper functions
const getDomainName = (domain: string): string => {
  const domainMap: Record<string, string> = {
    "ONDC:RET10": "Grocery",
    "ONDC:RET11": "F&B",
    "ONDC:RET12": "Fashion",
    "ONDC:RET13": "BPC",
    "ONDC:RET14": "Electronics",
    "ONDC:RET16": "Home & Decor",
  };
  return domainMap[domain] || domain;
};

// Function to determine veg/non-veg status
const getVegStatus = (product: ProductSearchResult) => {
  if (product.diet_type) {
    const dietType = product.diet_type.toLowerCase();

    const nonVeg =
      dietType.includes("non-veg") ||
      dietType.includes("non_veg") ||
      dietType.includes("meat") ||
      dietType.includes("chicken") ||
      dietType.includes("mutton") ||
      dietType.includes("fish");

    const veg =
      (dietType.includes("veg") || dietType.includes("vegetarian")) && !nonVeg;

    return { veg, nonVeg };
  }

  const domain = getDomainName(product.domain || "");
  if (domain === "F&B") {
    return { veg: true, nonVeg: false };
  }

  return { veg: false, nonVeg: false };
};

const FoodCatCard: FC<{
  item: [string, ProductSearchResult[]];
}> = ({ item: [storeId, products] }) => {
  if (!products || products.length === 0) {
    return (
      <View style={styles.card}>
        <Text>No products available</Text>
      </View>
    );
  }

  const firstProduct = products[0];
  if (!firstProduct) {
    return (
      <View style={styles.card}>
        <Text>Invalid product data</Text>
      </View>
    );
  }

  const store = firstProduct.store || {
    name: "Unknown Store",
    symbol: "",
    slug: storeId,
    address: { street: "Address not available" },
  };

  return (
    <View style={styles.card}>
      {/* Store Header - Food Theme */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.storeInfo}
          onPress={() => {
            if (store.slug) {
              router.push(`/(tabs)/home/result/productListing/${store.slug}`);
            }
          }}
        >
          <ImageComp
            source={{ uri: store.symbol || "https://via.placeholder.com/60" }}
            imageStyle={styles.storeImage}
            resizeMode="cover"
          />
          <View style={styles.storeDetails}>
            <Text style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Text>
            <Text style={styles.storeMetrics} numberOfLines={1}>
              {store.address?.street || "Address not available"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (store.slug) {
              router.push(`/(tabs)/home/result/productListing/${store.slug}`);
            }
          }}
          style={styles.visitStoreButton}
        >
          <Ionicons name="arrow-forward" size={20} color="#f2663c" />
        </TouchableOpacity>
      </View>

      {/* Products Carousel - Horizontal Layout for Food */}
      <View style={styles.productsCarousel}>
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(product, index) =>
            `${product.slug || product.catalog_id || index}`
          }
          contentContainerStyle={styles.productsContainer}
          renderItem={({ item: product }) => {
            const productId = Array.isArray(product.slug)
              ? product.slug[0]
              : product.slug || product.catalog_id;
            const discountPercent = product.price?.offerPercent || 0;
            const { veg, nonVeg } = getVegStatus(product);

            return (
              <View style={styles.productCard}>
                {/* Image Section with Food-specific styling */}
                <View style={{ position: "relative" }}>
                  <ImageComp
                    source={{
                      uri:
                        product.symbol || "https://via.placeholder.com/120",
                    }}
                    imageStyle={styles.productImage}
                    resizeMode="cover"
                  />

                  {/* Veg/Non-veg badge on image */}
                  {(veg || nonVeg) && (
                    <View style={styles.vegBadge}>
                      <MaterialCommunityIcons
                        name="square"
                        size={20}
                        color={veg ? "#10b981" : "#ef4444"}
                      />
                      <View style={styles.vegDot}>
                        <MaterialCommunityIcons
                          name="circle"
                          size={10}
                          color={veg ? "#10b981" : "#ef4444"}
                        />
                      </View>
                    </View>
                  )}

                  {discountPercent > 0 && (
                    <View style={styles.productDiscountBadge}>
                      <Text style={styles.productDiscountText}>
                        {Math.ceil(discountPercent)}% OFF
                      </Text>
                    </View>
                  )}

                  <View style={styles.likeButtonContainer}>
                    <LikeButton productId={productId} color="#f2663c" />
                  </View>
                </View>

                {/* Info + Price + Add to Cart */}
                <TouchableOpacity
                  style={styles.productInfo}
                  onPress={() => {
                    if (product.slug) {
                      router.push(
                        `/(tabs)/home/result/productDetails/${product.slug}`
                      );
                    }
                  }}
                >
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name || "Product Name"}
                  </Text>

                  {/* Price + AddToCart Row */}
                  <View style={styles.priceCartRow}>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>
                        ₹{product.price?.value || 0}
                      </Text>
                      {product.price?.maximum_value &&
                        product.price.maximum_value > product.price.value && (
                          <Text style={styles.originalPrice}>
                            ₹{product.price.maximum_value}
                          </Text>
                        )}
                    </View>

                    <AddToCart
                      storeId={product.store_id || storeId}
                      slug={product.slug || product.catalog_id}
                      catalogId={product.catalog_id}
                      price={product.price?.value || 0}
                      productName={product.name || "Product"}
                      customizable={product.customizable || false}
                      directlyLinkedCustomGroupIds={
                        product.directlyLinkedCustomGroupIds || []
                      }
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#f2663c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#fff0ec",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff0ec",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fff5f0",
    borderWidth: 2,
    borderColor: "#ffe8dc",
  },
  storeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  storeMetrics: {
    fontSize: 13,
    color: "#666",
  },
  visitStoreButton: {
    backgroundColor: "#fff5f0",
    padding: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffe8dc",
  },
  productsCarousel: {
    backgroundColor: "#fffbf8",
    borderRadius: 14,
    padding: 10,
    marginTop: 4,
  },
  productsContainer: {
    paddingLeft: 4,
  },
  productCard: {
    width: width * 0.44,
    marginRight: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#ffe8dc",
    overflow: "hidden",
    shadowColor: "#f2663c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 110,
    backgroundColor: "#fff5f0",
  },
  productInfo: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    flex: 1,
    justifyContent: "flex-start",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 18,
  },
  priceCartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f2663c",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  productDiscountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#f2663c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  productDiscountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  likeButtonContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  vegBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#fff",
    padding: 3,
    borderRadius: 4,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vegDot: {
    position: "absolute",
    top: 8,
    left: 8,
  },
});

export default FoodCatCard;