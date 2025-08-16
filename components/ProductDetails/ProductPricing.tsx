import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Discount } from "./SVG";
import { router } from "expo-router";

interface Store {
  name: string;
  slug: string;
}

interface ProductPricingProps {
  store: Store;           // ✅ store object with slug + name
  description: string;
  maxPrice: number;
  price: number;
  discount: number;
}

const { width } = Dimensions.get("window");

const ProductPricing: FC<ProductPricingProps> = ({
  store,
  description,
  maxPrice,
  price,
  discount,
}) => {
  return (
    <View style={styles.container}>
      {/* ✅ Correct: store.slug used for navigation */}
      <TouchableOpacity
        onPress={() =>
          router.push(`/(tabs)/home/result/productListing/${store.slug}`)
        }
        activeOpacity={0.7}
      >
        <Text style={{ textAlign: "left" }}>
          Visit / Explore{" "}
          <Text style={{ color: "#F13A3A", fontWeight: "900" }}>
            {store.name}
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Product description */}
      <Text style={styles.description}>{description}</Text>

      <View style={styles.divider} />

      {/* Pricing and discount */}
      <View style={styles.priceRow}>
        <View style={styles.priceInfo}>
          {maxPrice > price && (
            <Text style={styles.strikePrice}>₹ {Math.ceil(maxPrice)}</Text>
          )}
          <Text style={styles.rupee}>₹</Text>
          <Text style={styles.finalPrice}>{price}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Discount />
            <Text style={styles.discountText}>{Math.ceil(discount)} %</Text>
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
    backgroundColor: "#fff",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.05,
    marginHorizontal: width * 0.05,
    elevation: 5,
    borderRadius: 10,
  },
  description: {
    color: "#000",
    fontWeight: "400",
    fontSize: 13,
    paddingVertical: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEFF1",
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: width * 0.02,
  },
  strikePrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
    fontWeight: "400",
    color: "#495057",
  },
  rupee: {
    fontSize: 14,
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: "900",
  },
  discountBadge: {
    backgroundColor: "#1DA578",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    borderRadius: 100,
  },
  discountText: {
    color: "white",
  },
  taxInfo: {
    fontSize: 12,
    color: "#495057",
  },
});
