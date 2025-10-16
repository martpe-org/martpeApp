import React, { FC } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FetchProductDetail } from "../product/fetch-product-type";

interface ProductDetailsInfoProps {
  product: FetchProductDetail;
}

const ProductPricing: FC<ProductDetailsInfoProps> = ({ product }) => {
  const price =
    product.price.value === 0
      ? Number(product.price.default_selection?.value) ||
        Number(product.price.range?.lower) ||
        product.priceRangeDefault ||
        0
      : product.price.value;

  const maxPrice = product.price.maximum_value || 0;
  const discount = product.price.offerPercent || 0;
  const weight =
    product.unitized?.measure?.value && product.unitized?.measure?.unit
      ? `${product.unitized.measure.value} ${product.unitized.measure.unit}`
      : "";

  return (
    <View style={styles.container}>
      {/* Product name */}
      <Text style={styles.productName}>{product.name}</Text>

      {/* Description */}
      {product.long_desc ? (
        <Text style={styles.description} numberOfLines={4}>
          {product.long_desc.replace(/<[^>]+>/g, "")}
        </Text>
      ) : null}
      {/* Product weight */}
      {weight ? <Text style={styles.weightText}>{weight}</Text> : null}

      {/* Price section */}
      <View style={styles.priceRow}>
        <View style={styles.priceInfo}>
          {maxPrice > price && (
            <Text style={styles.strikePrice}>₹ {Math.ceil(maxPrice)}</Text>
          )}
          <Text style={styles.finalPrice}>₹ {price}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{Math.ceil(discount)}% OFF</Text>
          </View>
        )}
      </View>
      <Text style={styles.taxInfo}>Inclusive of all taxes</Text>
    </View>
  );
};

export default ProductPricing;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "#fff",
    width: "100%",
  },
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#495057",
    lineHeight: 18,
    marginBottom: 6,
  },
  weightText: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  priceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strikePrice: {
    fontSize: 15,
    color: "#868e96",
    textDecorationLine: "line-through",
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  discountBadge: {
    backgroundColor: "#1DA578",
    borderRadius: 100,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  discountText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  taxInfo: {
    fontSize: 12,
    color: "#868e96",
  },
});
