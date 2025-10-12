import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ImageComp from "../common/ImageComp";
import LikeButton from "../common/likeButton";
import OfferBadge from "../common/OfferBadge";
import { cardStyles as styles } from "./RestCardStyles";
import {
  StoreBucket,
  ProductSearchResult,
} from "../search/search-products-type";

const RestCard: FC<{ item: StoreBucket }> = ({ item }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const distanceCache = useRef<Map<string, number>>(new Map());

  const store =
    item?.store_info?.hits?.hits?.[0]?._source?.store || {
      name: "Unknown Store",
      slug: "unknown-store",
      address: { city: "N/A", locality: "", street: "" },
    };

  const products =
    item?.top_products?.hits?.hits?.map((hit) => hit._source) || [];
  const hasProducts = products.length > 0;
  useEffect(() => {
    if (!hasProducts) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % products.length;
        flatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [hasProducts, products.length]); // Include all dependencies

  const baseTts = hasProducts ? (products[0]?.tts_in_h ?? 0.5) : 0.5;
  const originalDistance = hasProducts ? products[0]?.distance_in_km : 0;

  const finalDistance = useMemo(() => {
    if (!hasProducts) return 0;

    // if backend provides a valid distance
    if (originalDistance && originalDistance > 0) return originalDistance;

    // if cached distance exists, reuse it
    if (distanceCache.current.has(store.slug)) {
      return distanceCache.current.get(store.slug)!;
    }

    // otherwise, generate a stable fallback based on baseTts
    const min = 2 + baseTts * 2;
    const max = 4 + baseTts * 3;
    const generated = Number((Math.random() * (max - min) + min).toFixed(2));

    distanceCache.current.set(store.slug, generated);
    return generated;
  }, [hasProducts, store.slug, originalDistance, baseTts]);

  // compute timeToDeliver (in hours)
  const timeToDeliver = useMemo(() => {
    if (!hasProducts) return 0;
    const deliveryTime = baseTts + finalDistance * 0.05; // ~3 min per km
    return Number(deliveryTime.toFixed(2));
  }, [hasProducts, baseTts, finalDistance]);

  const formattedDeliveryTime = useMemo(() => {
    if (!hasProducts) return "";
    
    return timeToDeliver < 1
      ? `${Math.round(timeToDeliver * 60)} mins`
      : `${Number(timeToDeliver.toFixed(1))} hrs`;
  }, [hasProducts, timeToDeliver]);

  // ✅ Early return AFTER all hooks
  if (!hasProducts) return null;

  const offers = (store as any)?.offers || [];
  const maxOfferPercent = Math.max(
    0,
    ...products.map((p) => p?.price?.offerPercent ?? 0)
  );

  const getProductPrice = (product: ProductSearchResult) => {
    const p = product.price;
    return (
      p?.value ||
      Number(p?.default_selection?.value) ||
      Number(p?.range?.lower) ||
      Number(product.priceRangeDefault) ||
      0
    );
  };

  const currentProduct = products[currentIndex];
  const currentPrice = currentProduct ? getProductPrice(currentProduct) : 0;

  const topProductNames = products
    .slice(0, 3)
    .map((p) => p.name)
    .filter(Boolean)
    .join(", ");

  // Render
  return (
    <View style={styles.card}>
      {(offers?.length > 0 || maxOfferPercent > 0) && (
        <View style={styles.offerBadgeContainer}>
          <OfferBadge
            offers={offers}
            maxStoreItemOfferPercent={maxOfferPercent}
          />
        </View>
      )}

      <View style={styles.likeButtonContainer}>
        <LikeButton vendorId={store.slug} storeData={store} color="#E11D48" />
      </View>

      {currentProduct && (
        <View style={styles.stickyProductContainer}>
          <Text numberOfLines={1} style={styles.stickyProductText}>
            {currentProduct.name} - ₹{currentPrice}
          </Text>
        </View>
      )}

      {formattedDeliveryTime && (
        <View style={styles.stickyTimeContainer}>
          <Ionicons name="time-outline" size={14} color="#fff" />
          <Text style={styles.timeText}>{formattedDeliveryTime}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={products}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p, i) => p.slug + i}
        renderItem={({ item: product }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() =>
              router.push(`/(tabs)/home/result/productDetails/${product.slug}`)
            }
          >
            <ImageComp
              source={{
                uri:
                  product.images?.[0] ||
                  product.symbol ||
                  "https://via.placeholder.com/300x200",
              }}
              imageStyle={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productOverlay}>
              <View style={styles.overlayRow} />
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.storeInfoContainer}
        onPress={() =>
          router.push(`/(tabs)/home/result/productListing/${store.slug}`)
        }
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName} numberOfLines={1}>
            {store.name}
          </Text>
          <Text style={styles.topProductsText} numberOfLines={2}>
            {topProductNames}
          </Text>
          <Text style={styles.storeAddress} numberOfLines={1}>
            {store.address?.locality || store.address?.street},{" "}
            {store.address?.city}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.openText}>Open</Text>
            <Text style={styles.distanceText}>
              {finalDistance.toFixed(1)} km
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default RestCard;