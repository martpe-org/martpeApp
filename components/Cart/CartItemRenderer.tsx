import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import ChangeQtyButton from "./ChangeQtyButton";

interface CartItemRendererProps {
  item: CartItemType;
  onQtyChange: (itemId: string, newQty: number) => void;
}

const CartItemRenderer: React.FC<CartItemRendererProps> = ({
  item,
  onQtyChange,
}) => {
  const toast = useToast();

  if (!item || !item._id) return null;

  const productName = item.product?.name || "Unknown Product";
  const productImage = item.product?.symbol;
  const unitPrice = item.unit_price || 0;
  const totalPrice = item.total_price || (unitPrice * (item.qty || 1));
  const isAvailable = item.product?.instock;
  const hasCustomizations = item.selected_customizations?.length > 0;

  const formatCurrency = (amt: number) =>
    `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;

  const handleProductPress = () => {
    if (item.product?.slug || item.slug) {
      const slug = item.product?.slug || item.slug;
      router.push(
        `/(tabs)/home/result/productDetails/${slug}`
      );
    } else {
      toast.show("Product details not available", { type: "warning" });
    }
  };

  const handleQtyChange = (newQty: number) => {
    onQtyChange(item._id, newQty);
  };

const renderCustomizations = () => {
  if (!hasCustomizations) return null;

  return (
    <View style={styles.customizationsContainer}>
      <Text style={styles.customizationsLabel}>Customizations:</Text>
      {item.selected_customizations?.map((customization, index) => (
        <Text key={index} style={styles.customizationText}>
          • {customization.name}
        </Text>
      ))}
    </View>
  );
};

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
                {/* Quantity Controls Row */}
        <View style={styles.controlsRow}>
<ChangeQtyButton
  cartItemId={item._id}
  qty={item.qty || 1}
  instock={item.product?.instock}
  customizable={item.product?.customizable}
  productName={productName}
  storeId={item.store_id}
  customGroupIds={item.product?.directlyLinkedCustomGroupIds ?? []}
  productPrice={unitPrice}
  onQtyChange={handleQtyChange}
/>

        </View>
      </TouchableOpacity>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.detailsContainer}>
          <Text style={[styles.name, !isAvailable && styles.unavailableName]} numberOfLines={2}>
            {productName}
          </Text>
          
          {!isAvailable && (
            <Text style={styles.unavailableLabel}>Currently unavailable</Text>
          )}
          
          {/* Customizations */}
          {renderCustomizations()}
          
          <View style={styles.priceContainer}>
            <Text style={[styles.price, !isAvailable && styles.unavailablePrice]}>
              Unit: {formatCurrency(unitPrice)}
            </Text>
            <Text style={[styles.quantity, !isAvailable && styles.unavailablePrice]}>
              Qty: {item.qty || 1}
            </Text>
          </View>
          
          <Text style={[styles.total, !isAvailable && styles.unavailablePrice]}>
            Total: {formatCurrency(totalPrice)}
          </Text>
        </View>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    width: 80,
    height: 100,
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
    flexDirection: "column",
  },
  detailsContainer: {
    flex: 1,
    marginBottom: 8,
  },
  name: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1A202C",
  },
  unavailableName: {
    color: "#718096",
  },
  unavailableLabel: {
    fontSize: 11,
    color: "#E53E3E",
    fontWeight: "500",
    marginBottom: 4,
  },
  customizationsContainer: {
    marginBottom: 6,
    paddingVertical: 2,
  },
  customizationsLabel: {
    fontSize: 11,
    color: "#4A5568",
    fontWeight: "600",
    marginBottom: 2,
  },
  customizationText: {
    fontSize: 10,
    color: "#718096",
    lineHeight: 14,
  },
  moreCustomizationsText: {
    fontSize: 10,
    color: "#A0AEC0",
    fontStyle: "italic",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  price: {
    color: "#4A5568",
    fontSize: 12,
  },
  unavailablePrice: {
    color: "#A0AEC0",
  },
  total: {
    fontWeight: "600",
    fontSize: 13,
    color: "#2F855A",
  },
  quantity: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

export default CartItemRenderer;