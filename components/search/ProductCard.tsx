import { styles } from "@/app/(tabs)/home/result/searchStyle";
import { router } from "expo-router";
import React, { FC } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductSearchResult } from "./search-products-type";
import ImageComp from "../common/ImageComp";
import LikeButton from "../common/likeButton";
import AddToCart from "../common/AddToCart";

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

// Simple components
const VegIndicator: FC = () => (
  <View style={styles.vegIndicator}>
    <Text style={[styles.vegDot, { color: "#4CAF50" }]}>●</Text>
  </View>
);

// Product Card Component
const ProductCard: FC<{
  item: [string, ProductSearchResult[]];
}> = ({ item: [storeId, products] }) => {
  const firstProduct = products[0];
  if (!firstProduct?.store) return null;

  const store = firstProduct.store;
  const domainName = getDomainName(firstProduct.domain);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.storeInfo}
          onPress={() =>
            router.push(`/(tabs)/home/result/productListing/${store.slug}`)
          }
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
            <Text style={styles.storeMetrics}>
              <Text>
                {Math.round((firstProduct.tts_in_h || 1) * 60)}min • {" "}
              </Text>
              <Text>{firstProduct.distance_in_km.toFixed(1)}km</Text>
            </Text>
            {(firstProduct.price.offerPercent || 0) > 0 && (
              <Text style={styles.offerText}>
                Up to {Math.ceil(firstProduct.price.offerPercent || 0)}% Off
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(product, index) => `${product.slug}-${index}`}
        contentContainerStyle={styles.productsContainer}
        renderItem={({ item: product }) => {
          const productId = Array.isArray(product.slug) ? product.slug[0] : product.slug;
          const discountPercent = product.price.offerPercent || 0;

          return (
            <View style={styles.productCard}>
              {/* Product Image with overlays */}
              <View style={{ position: 'relative' }}>
                <ImageComp
                  source={{
                    uri: product.symbol || "https://via.placeholder.com/120",
                  }}
                  imageStyle={styles.productImage}
                  resizeMode="cover"
                />

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <View style={styles.productDiscountBadge}>
                    <Text style={styles.productDiscountText}>
                      {Math.ceil(discountPercent)}% OFF
                    </Text>
                  </View>
                )}

                {/* Like Button */}
                <View style={styles.likeButtonContainer}>
                  <LikeButton productId={productId} color="#E11D48" />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.productInfo}
                onPress={() =>
                  router.push(
                    `/(tabs)/home/result/productDetails/${product.slug}`
                  )
                }
              >
                {domainName === "F&B" && <VegIndicator />}
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{product.price.value}</Text>
                  {product.price.offerPercent && (
                    <Text style={styles.originalPrice}>
                      ₹{product.price.maximum_value}
                    </Text>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <AddToCart
                    storeId={product.store_id}
                    slug={product.slug}
                    catalogId={product.catalog_id}
                    price={product.price?.value || 0}
                    productName={product.name}
                    customizable={product.customizable}
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
  );
};

export default ProductCard;