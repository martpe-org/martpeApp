import ImageComp from "@/components/common/ImageComp";
import AddToCart from "../../../components/ProductDetails/AddToCart";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

interface GroceryCardProps {
  id: string;
  itemName: string;
  cost: number;
  maxLimit?: number;
  providerId?: string;
  slug?: string;
  catalogId: string;
  weight?: string;
  unit?: string;
  originalPrice?: number;
  discount?: number;
  symbol?: string;
  image?: string;
  onPress?: () => void;
  item?: {
    id: string;
    catalog_id: string;
    provider?: { store_id: string };
    provider_id?: string;
    store_id?: string;
    descriptor?: {
      images?: string[];
      symbol?: string;
    };
  };
}

const GroceryCard: React.FC<GroceryCardProps> = ({
  id,
  itemName,
  cost,
  maxLimit,
  providerId,
  slug,
  catalogId,
  weight = "1kg",
  unit = "piece",
  originalPrice,
  discount,
  symbol,
  image,
  onPress,
  item,
}) => {
  const handlePress = onPress || (() => {
    router.push(`/(tabs)/home/result/productDetails/${slug || id}`);
  });

  const resolveStoreId = (): string => {
    if (providerId && providerId !== "unknown-store") return providerId;
    if (item) {
      if (item.provider?.store_id && item.provider.store_id !== "unknown-store") {
        return item.provider.store_id;
      }
      if (item.store_id && item.store_id !== "unknown-store") {
        return item.store_id;
      }
      if (item.provider_id && item.provider_id !== "unknown-store") {
        return item.provider_id;
      }
    }
    return catalogId || id || "default-store";
  };

  // Add logging to see what props are received
  console.log("🔍 GROCERYCARD - Props received:", {
    id,
    itemName,
    image,
    symbol,
    item: !!item,
    itemType: typeof item,
    itemKeys: item ? Object.keys(item) : "item is null/undefined"
  });

  // ✅ Enhanced image source logic with better fallbacks
  const getImageSource = () => {
    // Priority 1: Direct image prop (already resolved from container)
    if (image && typeof image === 'string' && image.trim() !== "") {
      const isValidUrl = image.startsWith("http") || image.startsWith("//") || 
                        image.includes("placeholder") || image.includes("unsplash");
      if (isValidUrl) {
        const finalUrl = image.startsWith("//") ? `https:${image}` : image;
        console.log("✅ GroceryCard Using image prop:", finalUrl);
        return finalUrl;
      }
    }

    // Priority 2: If item exists, check its properties
    if (item && typeof item === 'object') {
      console.log("🔍 GroceryCard item exists, checking properties:", Object.keys(item));
      
      // Check descriptor images
      if (item.descriptor?.images && Array.isArray(item.descriptor.images) && item.descriptor.images.length > 0) {
        const firstImage = item.descriptor.images[0];
        if (firstImage && firstImage.startsWith("http")) {
          console.log("✅ GroceryCard Using descriptor.images[0]:", firstImage);
          return firstImage;
        }
      }

      // Check descriptor symbol
      if (item.descriptor?.symbol && item.descriptor.symbol.startsWith("http")) {
        console.log("✅ GroceryCard Using descriptor.symbol:", item.descriptor.symbol);
        return item.descriptor.symbol;
      }
    }

    // Priority 3: Direct symbol prop
    if (symbol && typeof symbol === 'string' && symbol.startsWith("http")) {
      console.log("✅ GroceryCard Using symbol prop:", symbol);
      return symbol;
    }

    // Priority 4: Smart category-based images
    const productName = itemName.toLowerCase();
    let categoryImage = "";
    
    if (productName.includes("millet") || productName.includes("flour") || productName.includes("grain")) {
      categoryImage = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&h=150&fit=crop&auto=format";
    } else if (productName.includes("masala") || productName.includes("powder") || productName.includes("spice")) {
      categoryImage = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=150&h=150&fit=crop&auto=format";
    } else if (productName.includes("snack") || productName.includes("namkeen")) {
      categoryImage = "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=150&h=150&fit=crop&auto=format";
    } else if (productName.includes("noodle")) {
      categoryImage = "https://images.unsplash.com/photo-1555126634-323283e090fa?w=150&h=150&fit=crop&auto=format";
    } else if (productName.includes("cookie") || productName.includes("biscuit")) {
      categoryImage = "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=150&h=150&fit=crop&auto=format";
    } else if (productName.includes("salt")) {
      categoryImage = "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=150&h=150&fit=crop&auto=format";
    } else if (productName.includes("seasoning") || productName.includes("pepper")) {
      categoryImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&auto=format";
    }

    if (categoryImage) {
      console.log("🎯 GroceryCard Using category-based image:", { itemName, categoryImage });
      return categoryImage;
    }

    // Final fallback
    console.log("🔄 GroceryCard using final fallback for:", { id, itemName });
    return "https://via.placeholder.com/150?text=Grocery";
  };

  const storeId = resolveStoreId();
  
  // ✅ Ensure slug is always available (like in your mapping example)
  const resolvedSlug = slug || id;

  const imageSource = getImageSource();

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ImageComp
        source={imageSource}
        imageStyle={cardStyles.image}
        resizeMode="cover"
        fallbackSource={{
          uri: "https://via.placeholder.com/150?text=Grocery",
        }}
        loaderColor="#666"
        loaderSize="small"
      />

      <View style={cardStyles.info}>
        <Text style={cardStyles.name} numberOfLines={2}>
          {itemName}
        </Text>
        <Text style={cardStyles.weight}>
          {weight} / {unit}
        </Text>

        <View style={cardStyles.priceRow}>
          <Text style={cardStyles.price}>₹{cost.toFixed(2)}</Text>
          {discount && originalPrice && (
            <Text style={cardStyles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
          )}
        </View>

        {discount && <Text style={cardStyles.discount}>{discount}% off</Text>}
      </View>

      <View style={cardStyles.cartWrapper}>
        <AddToCart
          storeId={storeId}
          slug={resolvedSlug} // ✅ Use resolved slug
          catalogId={catalogId}
          price={cost}
        />
      </View>
    </TouchableOpacity>
  );
};

export default GroceryCard;

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 140, // ✅ match PersonalCare/FashionCard size
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  info: {
    flexGrow: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    color: "#333",
  },
  weight: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f14343",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#777",
  },
  discount: {
    fontSize: 12,
    color: "#28a745",
    marginTop: 2,
  },
  cartWrapper: {
    marginTop: 8,
  },
});