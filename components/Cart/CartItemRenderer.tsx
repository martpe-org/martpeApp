import React from "react";
import { Image,Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import ChangeQtyButton from "./ChangeQtyButton";
import { styles } from "./CartItemRendererStyles";
interface CartItemRendererProps {
  item: CartItemType;
  onQtyChange: (itemId: string, newQty: number) => void;
  catalogId?: string; // Add this prop
}

const CartItemRenderer: React.FC<CartItemRendererProps> = ({
  item,
  onQtyChange,
  catalogId = "default-catalog", // Default fallback
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
            catalogId={catalogId} // ✅ Pass catalogId
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
              Price: {formatCurrency(unitPrice)}
            </Text>
            <Text style={[styles.quantity, !isAvailable && styles.unavailablePrice]}>
              Qty: {item.qty || 1}
            </Text>
          </View>

          <Text style={[styles.total, !isAvailable && styles.unavailablePrice]}>
            Total (after customization): {formatCurrency(totalPrice)}
          </Text>
        </View>
      </View>
    </View>
  );
};



export default CartItemRenderer;