import ImageComp from "@/components/common/ImageComp";
import LikeButton from "@/components/common/likeButton";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AddToCart from "../../common/AddToCart";
import { StoreItem } from "@/components/store/fetch-store-items-type"; // ✅ Import StoreItem type
import { cardStyles } from "./PlpFnbCardStyles";
import ProductDetailsModal from "./ProductDetailsModal";

export interface PLPFnBCardProps {
  id: string;
  itemName: string;
  cost: number;
  maxLimit?: number;
  providerId?: string;
  slug?: string;
  productId: string | string[];
  catalogId: string;
  weight?: string;
  unit?: string;
  originalPrice?: number;
  discount?: number;
  symbol?: string;
  image?: string;
  onPress?: () => void;
  item?: StoreItem;
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[];
  veg?: boolean;
  non_veg?: boolean;
  spiceLevel?: string;
}

const PLPFnBCard: React.FC<PLPFnBCardProps> = ({
  id,
  itemName,
  cost,
  maxLimit,
  providerId,
  productId,
  slug,
  catalogId,
  originalPrice,
  discount,
  symbol,
  image,
  onPress,
  item,
  customizable = false,
  directlyLinkedCustomGroupIds = [],
  veg = false,
  non_veg = false,
}) => {
  const handlePress =
    onPress ||
    (() => {
      setModalVisible(true);
    });

  const resolveStoreId = (): string | null => {
    if (providerId && providerId !== "unknown-store") return providerId;
    if (item?.store_id && item.store_id !== "unknown-store") {
      return item.store_id;
    }
    return null;
  };

  const resolvedPrice = (() => {
    if (typeof cost === "number" && cost > 0) return cost;
    if (typeof item?.price?.value === "number" && item.price.value > 0)
      return item.price.value;
    if (typeof item?.priceRangeDefault === "number" && item.priceRangeDefault > 0)
      return item.priceRangeDefault; // ✅ Now this will work
    if (typeof item?.price === "number" && item.price > 0) return item.price;
    return null;
  })();

  /** ✅ Resolve original price (for strike-through display) */
  const resolvedOriginalPrice =
    typeof originalPrice === "number" && originalPrice > 0
      ? originalPrice
      : item?.price?.maximum_value ?? null;

  const safeStoreId = resolveStoreId();
  const resolvedSlug = slug || id;
  const productIdString = Array.isArray(productId) ? productId[0] : productId;
  const uniqueProductId = productIdString || slug || id;
  const [modalVisible, setModalVisible] = useState(false);

  /** ✅ Show AddToCart only if store and stock available */
  const renderAddToCart = () => {
    if (!safeStoreId) {
      return (
        <View style={cardStyles.cartWrapper}>
          <Text style={cardStyles.errorText}>Store ID missing</Text>
        </View>
      );
    }

    if (!item?.instock) {
      return (
        <View style={cardStyles.cartWrapper}>
          <Text style={cardStyles.outOfStockText}>Out of stock</Text>
        </View>
      );
    }

    return (
      <View style={cardStyles.cartWrapper}>
        <AddToCart
          price={resolvedPrice || 0}
          storeId={safeStoreId}
          slug={resolvedSlug}
          catalogId={catalogId}
          productName={itemName}
          customizable={customizable || directlyLinkedCustomGroupIds.length > 0}
          directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
        />
      </View>
    );
  };

  /** ✅ Fallback for description */
  const descriptionText =
    item?.short_desc ||
    (item as any)?.descriptor?.long_desc ||
    "";

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={cardStyles.content}>
        {/* Left - Text content */}
        <View style={cardStyles.textContainer}>
          <View style={cardStyles.headerRow}>
            {veg && (
              <MaterialCommunityIcons
                name="circle-box-outline"
                size={16}
                color="green"
                style={{ marginRight: 6 }}
              />
            )}
            {non_veg && (
              <MaterialCommunityIcons
                name="circle-box-outline"
                size={16}
                color="red"
                style={{ marginRight: 6 }}
              />
            )}
            <Text style={cardStyles.name} numberOfLines={1}>
              {itemName}
            </Text>
          </View>

          <View style={cardStyles.priceRow}>
            {resolvedPrice ? (
              <>
                <Text style={cardStyles.price}>
                  ₹{Number(resolvedPrice).toFixed(0).replace(/\.00$/, "")}
                </Text>
                {resolvedOriginalPrice &&
                  resolvedOriginalPrice > resolvedPrice && (
                    <Text style={cardStyles.originalPrice}>
                      {`₹${Number(resolvedOriginalPrice).toFixed(0)}`}
                    </Text>
                  )}
                {typeof discount === "number" && discount > 0 && (
                  <Text style={cardStyles.discount}>{discount}% OFF</Text>
                )}
              </>
            ) : (
              <Text style={cardStyles.errorText}>No price</Text>
            )}
          </View>

          {!!descriptionText && (
            <Text style={cardStyles.description} numberOfLines={2}>
              {descriptionText}
            </Text>
          )}
        </View>

        {/* Right - Image + Actions */}
        <View style={cardStyles.imageContainer}>
          <ImageComp
            source={image || symbol}
            imageStyle={cardStyles.image}
            resizeMode="cover"
            fallbackSource={{ uri: "https://picsum.photos/200/300" }}
            loaderColor="#666"
            loaderSize="small"
          />

      <View style={cardStyles.topActions}>
  <TouchableOpacity
    onPress={(e) => {
      e.stopPropagation?.();
    }}
    activeOpacity={0.8}
    style={cardStyles.likeButtonWrapper} // ✅ Added wrapper style
  >
    <LikeButton
      productId={uniqueProductId}
      color="#E11D48"
      productData={item}
    />
  </TouchableOpacity>
</View>


          <View style={cardStyles.addToCartWrapper}>{renderAddToCart()}</View>
        </View>
      </View>
      <ProductDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        productSlug={resolvedSlug}
      />
    </TouchableOpacity>
  );
};

export default PLPFnBCard;


