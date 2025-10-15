import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import ChangeQtyButton from "./ChangeQtyButton";
import { styles } from "./CartItemRendererStyles";

interface CartItemRendererProps {
  item: CartItemType;
  onQtyChange: (itemId: string, newQty: number) => void;
  catalogId?: string;
}

const CartItemRenderer: React.FC<CartItemRendererProps> = ({
  item,
  onQtyChange,
  catalogId = "default-catalog",
}) => {
  const toast = useToast();

  if (!item || !item._id) return null;

  // -----------------------------
  // ✅ Safe Data Extraction
  // -----------------------------
  const product = item.product;
  const productName = product?.name || "Unknown Product";
  const productImage = product?.symbol;
  const isAvailable = product?.instock ?? true;
  const hasCustomizations = item.selected_customizations?.length > 0;

  // ✅ Fallback price logic (handles ₹0 bug)
  const fallbackUnitPrice =
    item.unit_price && item.unit_price > 0
      ? item.unit_price
      : product?.price?.value && product?.price?.value > 0
      ? product.price.value
      : product?.price?.maximum_value && product?.price?.maximum_value > 0
      ? product.price.maximum_value
      : 0;

  const fallbackOriginalPrice =
    product?.price?.maximum_value && product.price.maximum_value > 0
      ? product.price.maximum_value
      : fallbackUnitPrice;

  const hasDiscount =
    fallbackOriginalPrice > fallbackUnitPrice && fallbackUnitPrice > 0;

  // -----------------------------
  // ✅ Currency Formatter
  // -----------------------------
  const formatCurrency = (amt: number) => {
    if (!amt || amt <= 0) return "₹0";
    const formatted = amt.toFixed(2);
    return `₹${formatted.endsWith(".00")
      ? formatted.slice(0, -3)
      : formatted.replace(/\.?0+$/, "")}`;
  };

  // -----------------------------
  // ✅ Handlers
  // -----------------------------
  const handleProductPress = () => {
    const slug = product?.slug || item.slug;
    if (slug) {
      router.push(`/(tabs)/home/result/productDetails/${slug}`);
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
        {item.selected_customizations?.map((customization, index) => (
          <Text key={index} style={styles.customizationText}>
            {customization.name}
          </Text>
        ))}
      </View>
    );
  };

  // -----------------------------
  // ✅ Price Renderer
  // -----------------------------
  const renderPrice = () => {
    if (hasDiscount) {
      return (
        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>
            {formatCurrency(fallbackOriginalPrice)}
          </Text>
          <Text style={styles.discountedPrice}>
            {formatCurrency(fallbackUnitPrice)}
          </Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.singlePrice}>
          {formatCurrency(fallbackUnitPrice)}
        </Text>
      );
    }
  };
  const renderDietIcon = () => {
    let dietType = product?.diet_type;

    if (!dietType) {
      const foodCategories = [
        "pizza",
        "burger",
        "food",
        "meal",
        "snack",
        "beverage",
        "drink",
      ];
      const isFood = foodCategories.some((cat) =>
        productName.toLowerCase().includes(cat)
      );
      if (!isFood) return null;
    }

    const dietTypeLower = dietType?.toLowerCase();
    const isVeg =
      dietTypeLower === "veg" || dietTypeLower === "vegetarian";
    const isNonVeg =
      dietTypeLower === "non-veg" ||
      dietTypeLower === "nonveg" ||
      dietTypeLower === "non_veg";

    if (!isVeg && !isNonVeg) return null;

    const borderColor = isVeg ? "#0B8E49" : "#E43B3B";
    const dotColor = isVeg ? "#0B8E49" : "#E43B3B";

    return (
      <View style={[styles.dietBox, { borderColor }]}>
        <View style={[styles.dietDot, { backgroundColor: dotColor }]} />
      </View>
    );
  };

  // -----------------------------
  // ✅ Render
  // -----------------------------
  return (
    <View style={[styles.item, !isAvailable && styles.unavailableItem]}>
      {/* Product Image */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleProductPress}
        disabled={!isAvailable}
      >
        {productImage ? (
          <Image
            source={{ uri: productImage }}
            style={[styles.image, !isAvailable && styles.unavailableImage]}
            defaultSource={{
              uri: "https://via.placeholder.com/80?text=IMG",
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.image,
              styles.placeholderImage,
              !isAvailable && styles.unavailableImage,
            ]}
          >
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
        <View style={styles.headerRow}>
          <View style={styles.nameAndPriceContainer}>
            <View style={styles.nameRow}>
              {renderDietIcon()}
              <Text
                style={[styles.name, !isAvailable && styles.unavailableName]}
                numberOfLines={2}
              >
                {productName}
              </Text>
            </View>

            {renderCustomizations()}
            {renderPrice()}
          </View>

          <View style={styles.controlsContainer}>
            <ChangeQtyButton
              cartItemId={item._id}
              qty={item.qty || 1}
              catalogId={catalogId}
              instock={product?.instock}
              customizable={product?.customizable}
              productName={productName}
              storeId={item.store_id}
              customGroupIds={product?.directlyLinkedCustomGroupIds ?? []}
              productPrice={fallbackUnitPrice}
              onQtyChange={handleQtyChange}
            />
          </View>
        </View>

        {!isAvailable && (
          <Text style={styles.unavailableLabel}>Currently unavailable</Text>
        )}
      </View>
    </View>
  );
};

export default CartItemRenderer;
