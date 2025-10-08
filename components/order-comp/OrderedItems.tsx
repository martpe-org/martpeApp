import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FetchOrderDetailType } from "@/components/order/fetch-order-detail-type";
import ImageComp from "@/components/common/ImageComp";
import { router } from "expo-router";

interface OrderedItemsProps {
  orderDetail: FetchOrderDetailType;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderedItems({ orderDetail }: OrderedItemsProps) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const handleStorePress = (slug: string) => {
    router.push(`/(tabs)/home/result/productDetails/${slug}`);
  };

  const toggleCustomization = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem(expandedItem === index ? null : index);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bag-outline" size={18} color="#6b7280" />
        <Text style={styles.sectionTitle}>Ordered Items</Text>
      </View>

      {orderDetail.order_items.map((item, index) => (
        <TouchableOpacity
          style={styles.itemCard}
          key={index}
          onPress={() => handleStorePress(item.product_slug)}
          activeOpacity={0.8}
        >
          {/* Header row */}
          <View style={styles.itemHeader}>
            <View style={styles.itemBrand}>
              <ImageComp
                source={{ uri: orderDetail.store.symbol }}
                imageStyle={styles.itemLogo}
                resizeMode="cover"
              />
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemBrandName}>1 unit</Text>
              </View>
            </View>
            <View style={styles.itemPricing}>
              <Text style={styles.itemPrice}>₹{item.total_price}</Text>
              <Text style={styles.itemQuantity}>x {item.order_qty}</Text>
              <Text style={styles.itemTotalPrice}>₹{item.total_price}</Text>
            </View>
          </View>

          {/* Customization toggle */}
          <TouchableOpacity
            style={styles.customizationButton}
            onPress={() => toggleCustomization(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.customizationText}>
              View Customization Details
            </Text>
            <Ionicons
              name={expandedItem === index ? "chevron-up" : "chevron-down"}
              size={16}
              color="#6b1010"
            />
          </TouchableOpacity>

          {/* Expanded customizations */}
          {expandedItem === index && (
            <View style={styles.customizationContainer}>
              {item.customizations && item.customizations.length > 0 ? (
                item.customizations.map((c, i) => (
                  <View key={i} style={styles.customizationRow}>
                    <Text style={styles.customizationKey}>{c.name}</Text>
                    <Text style={styles.customizationValue}>
                      x{c.order_qty} · ₹{c.total_price}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noCustomization}>
                  No customisation for this product
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 6,
  },
  itemCard: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
     elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemBrand: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  itemLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  itemBrandName: {
    fontSize: 11,
    color: "#6b7280",
  },
  itemPricing: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16a34a",
  },
  itemQuantity: {
    fontSize: 13,
    color: "#6b7280",
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a",
  },
  customizationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 8,
    borderRadius: 26,
    marginRight: 130,
    padding: 8,
backgroundColor: "#e9cece",
  },
  customizationText: {
    fontSize: 13,
    color: "#ef4444",
    marginRight: 4,
    fontWeight: "500",
  },
  customizationContainer: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 1,
  },
  customizationRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  customizationKey: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginRight: 4,
  },
  customizationValue: {
    fontSize: 12,
    color: "#6b7280",
  },
  noCustomization: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#9ca3af",
  },
});
