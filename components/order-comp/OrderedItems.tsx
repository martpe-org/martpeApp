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

// Enable smooth animation on Android
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
        <Ionicons name="bag-outline" size={20} color="#6b7280" />
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
                resizeMode="cover"
              />
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemBrandName}>1 unit</Text>
                <Text style={styles.itemNote}>Thank you for Digital Order</Text>
              </View>
            </View>
            <View style={styles.itemPricing}>
              <Text style={styles.itemQuantity}>x {item.order_qty}</Text>
              <Text style={styles.itemPrice}>₹{item.total_price}</Text>
            </View>
          </View>

          {/* Customization toggle */}
          <TouchableOpacity
            style={styles.customizationButton}
            onPress={() => toggleCustomization(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.customizationText}>
              {expandedItem === index
                ? "Hide Customisation Details"
                : "View Customisation Details"}
            </Text>
            <Ionicons
              name={expandedItem === index ? "chevron-up" : "chevron-forward"}
              size={16}
              color="#ef4444"
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
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  itemCard: {
    backgroundColor: "#fafafa", // ✅ use white for a clean card
    padding: 16,
    borderRadius: 30,
    marginBottom: 12,
    elevation: 3,
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
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  itemBrandName: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  itemNote: {
    fontSize: 12,
    color: "#10b981",
  },
  itemPricing: {
    alignItems: "flex-end",
  },
  itemQuantity: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
  },
  customizationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3e8ff",
  },
  customizationText: {
    fontSize: 14,
    color: "#ef4444",
    marginRight: 6,
    fontWeight: "500",
  },
  customizationContainer: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff", // ✅ white background for card look

    // Elevation for Android
    elevation: 3,
  },

  customizationRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  customizationKey: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginRight: 4,
  },
  customizationValue: {
    fontSize: 13,
    color: "#6b7280",
  },
  noCustomization: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#9ca3af",
  },
});
