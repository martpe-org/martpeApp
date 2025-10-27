import { router } from "expo-router";
import React, { FC } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageComp from "../common/ImageComp";
import LikeButton from "../common/likeButton";
import AddToCart from "../common/AddToCart";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ProductSearchResult } from "../search/search-products-type";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./ProductCardStyles";

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
  if (domain === "F&B") return { veg: true, nonVeg: false };
  return { veg: false, nonVeg: false };
};

const ProductCard: FC<{
  item: [string, ProductSearchResult[]];
}> = ({ item: [storeId, products] }) => {
  if (!products || products.length === 0)
    return (
      <View style={styles.card}>
        <Text>No products available</Text>
      </View>
    );

  const firstProduct = products[0];
  const store = firstProduct?.store || {
    name: "Unknown Store",
    symbol: "",
    slug: storeId,
    address: { street: "Address not available" },
  };

  const validProducts = products.filter(
    (p) => p.price?.value && p.price.value > 0
  );
  if (validProducts.length === 0) return null;

  return (
    <SafeAreaView style={styles.card}>
      {/* Store Header */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.storeInfo}
          onPress={() => {
            if (store.slug)
              router.push(`/(tabs)/home/result/productListing/${store.slug}`);
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
            if (store.slug)
              router.push(`/(tabs)/home/result/productListing/${store.slug}`);
          }}
          style={styles.visitStoreButton}
        >
          <Ionicons name="arrow-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Products Carousel */}
      <View style={styles.productsCarousel}>
        <FlatList
          data={validProducts}
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
            const priceValue = product.price?.value;
            const productSlug = product.slug || product.catalog_id;

            const handleCardPress = () => {
              if (productSlug) {
                router.push(`/(tabs)/home/result/productDetails/${productSlug}`);
              }
            };

            const handleLikePress = (e: any) => {
              e.stopPropagation?.(); // prevent navigation when liking
            };

            return (
              <TouchableOpacity
                style={styles.productCard}
                onPress={handleCardPress}
                activeOpacity={0.85}
              >
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

                  {/* Like button — independent of navigation */}
                  <View style={styles.likeButtonContainer}>
                    <TouchableOpacity onPress={handleLikePress}>
                      <LikeButton productId={productId} color="#E11D48" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
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

                  {/* Price + AddToCart */}
                  <View style={styles.priceCartRow}>
                    <View style={styles.priceRow}>
                      {priceValue && priceValue > 0 ? (
                        <>
                          <Text style={styles.price}>₹{priceValue}</Text>
                          {product.price?.maximum_value &&
                            product.price.maximum_value > priceValue && (
                              <Text style={styles.originalPrice}>
                                ₹{product.price.maximum_value}
                              </Text>
                            )}
                        </>
                      ) : (
                        <Text style={styles.unavailablePrice}>
                          Price unavailable
                        </Text>
                      )}
                    </View>

                    {priceValue && priceValue > 0 ? (
                      <AddToCart
                        storeId={product.store_id || storeId}
                        slug={product.slug || product.catalog_id}
                        catalogId={product.catalog_id}
                        price={priceValue}
                        productName={product.name || "Product"}
                        customizable={product.customizable || false}
                        directlyLinkedCustomGroupIds={
                          product.directlyLinkedCustomGroupIds || []
                        }
                      />
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProductCard;