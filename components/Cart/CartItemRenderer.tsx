import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { Ionicons } from "@expo/vector-icons";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import ChangeQtyButton from "./ChangeQtyButton";
import CustomizationGroupForCart from "../customization/CustomizationGroupForCart";

// ✅ Safe number conversion helper
const toNumber = (v: any): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = Number(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (v && typeof v === "object") {
    if ("value" in v) return toNumber((v as any).value);
    if ("amount" in v) return toNumber((v as any).amount);
  }
  return 0;
};

interface CartItemRendererProps {
  item: CartItemType;
  onQtyChange: (itemId: string, newQty: number) => void;
}

const CartItemRenderer: React.FC<CartItemRendererProps> = ({
  item,
  onQtyChange,
}) => {
  const toast = useToast();
  const [showCustomization, setShowCustomization] = useState(false);

  if (!item || !item._id) return null;

  const productName = item.product?.name || "Unknown Product";
  const productImage = item.product?.symbol;
  const isAvailable = item.product?.instock;

  const unitPrice = toNumber(item.product?.price ?? item.product?.price?.value);
  const qty = Math.max(1, toNumber(item.qty));

  // ✅ Use item.total_price if available, else fallback to unitPrice * qty
  const totalPrice = toNumber(item.total_price ?? unitPrice * qty);

  const formatCurrency = (amt: number | string | null | undefined) => {
    const n = toNumber(amt);
    return `₹${n.toFixed(2).replace(/\.?0+$/, "")}`;
  };

  const handleProductPress = () => {
    if (item.product?.slug) {
      router.push(
        `/(tabs)/home/result/productDetails/${item.product.slug}`
      );
    } else {
      toast.show("Product details not available", { type: "warning" });
    }
  };

  const handleQtyChange = (newQty: number) => {
    onQtyChange(item._id, newQty);
  };

  const handleEditCustomization = () => {
    setShowCustomization(true);
  };

  const handleCustomizationUpdate = () => {
    toast.show("Customizations updated", { type: "success" });
  };

  const isCustomizable = item.product?.customizable;
  const hasCustomGroupIds = item.product?.directlyLinkedCustomGroupIds?.length > 0;

  return (
    <View style={[styles.item, !isAvailable && styles.unavailableItem]}>
      {/* Product Image */}
      <TouchableOpacity
        style={styles.imageContainer}
        key={item._id}
        onPress={handleProductPress}
      >
        {productImage ? (
          <Image
            source={{ uri: productImage }}
            style={[styles.image, !isAvailable && styles.unavailableImage]}
            defaultSource={{
              uri: "https://via.placeholder.com/50?text=IMG",
            }}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, !isAvailable && styles.unavailableImage]}>
            <Text style={styles.placeholderText}>IMG</Text>
          </View>
        )}
        {!isAvailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>N/A</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={[styles.name, !isAvailable && styles.unavailableName]} numberOfLines={2}>
          {productName}
        </Text>
        {!isAvailable && (
          <Text style={styles.unavailableLabel}>Currently unavailable</Text>
        )}
        <Text style={[styles.price, !isAvailable && styles.unavailablePrice]}>
          Unit: {formatCurrency(unitPrice)}
        </Text>
        <Text style={[styles.total, !isAvailable && styles.unavailablePrice]}>
          Total: {formatCurrency(totalPrice)}
        </Text>
        <Text style={[styles.quantity, !isAvailable && styles.unavailablePrice]}>
          Qty: {item.qty || 1}
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.qtyContainer}>
        <ChangeQtyButton
          cartItemId={item._id}
          qty={item.qty || 1}
          max={item.product?.quantity}
          instock={item.product?.instock}
          customizable={item.product?.customizable}
          productName={productName}
          storeId={item.store_id}
          customGroupIds={item.product?.directlyLinkedCustomGroupIds ?? []}
          productPrice={unitPrice}
          onQtyChange={handleQtyChange}
        />

        {isCustomizable && hasCustomGroupIds && isAvailable && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditCustomization}
          >
            <Ionicons name="create-outline" size={16} color="#f14343" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Customization Modal */}
      {isCustomizable && hasCustomGroupIds && (
        <CustomizationGroupForCart
          cartItemId={item._id}
          productSlug={item.product?.slug || ""}
          storeId={item.store_id}
          catalogId={item.product?._id || ""}
          productPrice={unitPrice}
          directlyLinkedCustomGroupIds={item.product?.directlyLinkedCustomGroupIds || []}
          existingCustomizations={item.customizations || []}
          visible={showCustomization}
          onClose={() => setShowCustomization(false)}
          onUpdateSuccess={handleCustomizationUpdate}
          productName={productName}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unavailableItem: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E2E8F0",
    opacity: 0.7,
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  unavailableImage: {
    opacity: 0.5,
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
  unavailableOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  productInfo: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1A202C",
    marginBottom: 4,
  },
  unavailableName: {
    color: "#718096",
  },
  unavailableLabel: {
    fontSize: 11,
    color: "#E53E3E",
    fontWeight: "500",
    marginBottom: 2,
  },
  price: {
    color: "#4A5568",
    fontSize: 12,
    marginBottom: 2,
  },
  unavailablePrice: {
    color: "#A0AEC0",
  },
  total: {
    fontWeight: "600",
    fontSize: 13,
    color: "#2F855A",
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  qtyContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#f14343",
  },
  editButtonText: {
    color: "#f14343",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
});

export default CartItemRenderer;
