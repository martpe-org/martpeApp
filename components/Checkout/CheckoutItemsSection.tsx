import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { CartItem, CartItemType } from "@/app/(tabs)/cart/fetch-carts-type";

interface CheckoutItemsSectionProps {
  items: CartItem[] | CartItemType[];
}

const CheckoutItemsSection: React.FC<CheckoutItemsSectionProps> = ({ items }) => {
  const formatCurrency = (amt: number) =>
    `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;

  const totalItems = items?.length || 0;

  return (
    <View style={styles.itemsSection}>
      <Text style={styles.sectionTitle}>Order Items ({totalItems})</Text>

      {items.map((item, index) => {
        if (!item || !item._id) return null;

        const productName = item.product?.name || "Unknown Product";
        const productImage = item.product?.symbol;
        const unitPrice = item.unit_price || 0;
        const quantity = item.qty || 1;
        const itemTotal = unitPrice * quantity;

        return (
          <View key={item._id || index} style={styles.itemCard}>
            <TouchableOpacity
              style={styles.itemContent}
              onPress={() => {
                if (item.product?.slug) {
                  router.push(
                    `/(tabs)/home/result/productDetails/${item.product.slug}`
                  );
                }
              }}
              activeOpacity={0.7}
            >
              {/* Product Image */}
              <View style={styles.itemImageContainer}>
                {productImage ? (
                  <Image
                    source={{ uri: productImage }}
                    style={styles.itemImage}
                    onError={() =>
                      console.warn("Failed to load product image")
                    }
                  />
                ) : (
                  <View style={[styles.itemImage, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>IMG</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {productName}
                </Text>
                <Text style={styles.itemPrice}>
                  Unit: {formatCurrency(unitPrice)}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {quantity}</Text>
                <Text style={styles.itemTotal}>
                  Total: {formatCurrency(itemTotal)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  itemsSection: {
    backgroundColor: "white",
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  itemCard: {
    marginBottom: 8,
    marginHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    overflow: "hidden",
  },
  itemContent: {
    flexDirection: "row",
    padding: 12,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00BC66",
  },
});

export default CheckoutItemsSection;