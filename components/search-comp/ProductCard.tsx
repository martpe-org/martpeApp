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
import { SafeAreaView } from "react-native-safe-area-context";

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

const ProductCard: FC<{
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
    <SafeAreaView style={styles.card}>
      {/* Store Header */}
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
          <Ionicons name="arrow-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Products Carousel */}
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
                {/* Image Section */}
                <View style={{ position: "relative" }}>
                  <ImageComp
                    source={{
                      uri:
                        product.symbol || "https://via.placeholder.com/120",
                    }}
                    imageStyle={styles.productImage}
                    resizeMode="cover"
                  />

                  {discountPercent > 0 && (
                    <View style={styles.productDiscountBadge}>
                      <Text style={styles.productDiscountText}>
                        {Math.ceil(discountPercent)}% off
                      </Text>
                    </View>
                  )}

                  <View style={styles.likeButtonContainer}>
                    <LikeButton productId={productId} color="#E11D48" />
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
                  <View style={styles.nameRow}>
                    {veg && (
                      <MaterialCommunityIcons
                        name="circle-box-outline"
                        size={16}
                        color="green"
                        style={{ marginRight: 4 }}
                      />
                    )}
                    {nonVeg && (
                      <MaterialCommunityIcons
                        name="circle-box-outline"
                        size={16}
                        color="red"
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name || "Product Name"}
                    </Text>
                  </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  storeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeMetrics: {
    fontSize: 12,
    color: "#666",
  },
  visitStoreButton: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  productsCarousel: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
  },
  productsContainer: {
    paddingLeft: 4,
  },
  productCard: {
    width: width * 0.48,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 90,
    backgroundColor: "#f0f0f0",
  },
  productInfo: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    flex: 1,
    justifyContent: "flex-start",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  priceCartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginRight:4
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 11,
    fontWeight: "bold",
    color: "green",
    
  },
  originalPrice: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 6,
        marginRight:4

  },
  productDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 6,
    backgroundColor: "#2ecc71",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  productDiscountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  likeButtonContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
});

export default ProductCard;
