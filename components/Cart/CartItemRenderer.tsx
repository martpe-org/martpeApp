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

  const productName = item.product?.name || "Unknown Product";
  const productImage = item.product?.symbol;
  const unitPrice = item.unit_price || 0;
  const isAvailable = item.product?.instock;
  const hasCustomizations = item.selected_customizations?.length > 0;
  const originalPrice = item.product?.price?.maximum_value || unitPrice;
  const hasDiscount = originalPrice > unitPrice;

  const formatCurrency = (amt: number) => {
    const formatted = amt.toFixed(2);
    return `₹${formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted.replace(/\.?0+$/, "")}`;
  };

  const handleProductPress = () => {
    if (item.product?.slug || item.slug) {
      const slug = item.product?.slug || item.slug;
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

  const renderPrice = () => {
    if (hasDiscount) {
      return (
        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>{formatCurrency(originalPrice)}</Text>
          <Text style={styles.discountedPrice}>{formatCurrency(unitPrice)}</Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.singlePrice}>{formatCurrency(unitPrice)}</Text>
      );
    }
  };

  const getDietTypeFromProductName = (name: string): string | null => {
    if (!name) return null;
    
    const nameLower = name.toLowerCase();
    
    // Food items that are typically non-veg
    const nonVegKeywords = [
      'chicken', 'mutton', 'fish', 'prawn', 'shrimp', 'egg', 'meat', 
      'pork', 'beef', 'bacon', 'sausage', 'pepperoni', 'pizza'
    ];
    
    // Food items that are typically veg
    const vegKeywords = [
      'paneer', 'vegetable', 'veg', 'dal', 'rice', 'pasta', 
      'fries', 'salad', 'soup', 'bread'
    ];
    
    // Check for non-veg keywords first
    if (nonVegKeywords.some(keyword => nameLower.includes(keyword))) {
      return 'non-veg';
    }
    
    // Check for veg keywords
    if (vegKeywords.some(keyword => nameLower.includes(keyword))) {
      return 'veg';
    }
    
    return null;
  };

  const renderDietIcon = () => {
    // Try to get diet type from multiple sources
    let dietType = item.product?.diet_type;
    
    // If diet type is not available, try to infer from product name
    if (!dietType) {
      dietType = getDietTypeFromProductName(productName);
    }
    
    // If still no diet type, check if it's a food item or general product
    if (!dietType) {
      // For non-food items like watches, laptop stands, etc., don't show diet icon
      const isLikelyFoodItem = () => {
        const foodCategories = ['pizza', 'burger', 'food', 'meal', 'snack', 'beverage', 'drink'];
        const nameLower = productName.toLowerCase();
        return foodCategories.some(category => nameLower.includes(category));
      };
      
      if (!isLikelyFoodItem()) {
        return null; // Don't show diet icon for non-food items
      }
    }

    const dietTypeLower = dietType?.toLowerCase();
    const isVeg = dietTypeLower === "veg" || dietTypeLower === "vegetarian";
    const isNonVeg = dietTypeLower === "non-veg" || dietTypeLower === "nonveg" || dietTypeLower === "non_veg";

    if (!isVeg && !isNonVeg) {
      return null;
    }

    const borderColor = isVeg ? "#0B8E49" : "#E43B3B";
    const dotColor = isVeg ? "#0B8E49" : "#E43B3B";

    return (
      <View style={[styles.dietBox, { borderColor }]}>
        <View style={[styles.dietDot, { backgroundColor: dotColor }]} />
      </View>
    );
  };

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

      {/* Product Info and Controls */}
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

            {/* Customizations */}
            {renderCustomizations()}

            {renderPrice()}
          </View>
          <View style={styles.controlsContainer}>
            <ChangeQtyButton
              cartItemId={item._id}
              qty={item.qty || 1}
              catalogId={catalogId}
              instock={item.product?.instock}
              customizable={item.product?.customizable}
              productName={productName}
              storeId={item.store_id}
              customGroupIds={item.product?.directlyLinkedCustomGroupIds ?? []}
              productPrice={unitPrice}
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