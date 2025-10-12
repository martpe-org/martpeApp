import React, { FC, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ImageComp from "../common/ImageComp";
import LikeButton from "../common/likeButton";
import OfferBadge from "../common/OfferBadge";
import {
    cardStyles as styles,
} from "./RestCardStyles";
import {
    StoreBucket,
    ProductSearchResult,
} from "../search/search-products-type";

const RestCard: FC<{ item: StoreBucket }> = ({ item }) => {
    // Move all hooks to the top level - BEFORE any early returns
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const store =
        item?.store_info?.hits?.hits?.[0]?._source?.store || {
            name: "Unknown Store",
            slug: "",
            address: { city: "N/A", locality: "", street: "" },
        };

    const products =
        item?.top_products?.hits?.hits?.map((hit) => hit._source) || [];

    // useEffect hook must also be at the top level
    useEffect(() => {
        if (!products.length) return; // Conditional logic inside the effect
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = (prev + 1) % products.length;
                flatListRef.current?.scrollToIndex({
                    index: next,
                    animated: true,
                });
                return next;
            });
        }, 3000);
        
        return () => clearInterval(timer);
    }, [products.length]);

    // Early return AFTER all hooks are called
    if (!products.length) return null;

    const offers = (store as any)?.offers || [];
    const maxOfferPercent = Math.max(
        0,
        ...products.map((p) => p?.price?.offerPercent ?? 0)
    );

    const topProductNames = products
        .slice(0, 3)
        .map((p) => p.name)
        .filter(Boolean)
        .join(", ");

    const baseTts = products[0]?.tts_in_h ?? 0;
    const distance = products[0]?.distance_in_km ?? 0;
    const timeToDeliver = baseTts || distance ? baseTts + distance / 20 : null;

    const formattedDeliveryTime = timeToDeliver
        ? timeToDeliver < 1
            ? `${Math.round(timeToDeliver * 60)} mins`
            : `${Number(timeToDeliver.toFixed(1))} hrs`
        : null;

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

    // Get current product for sticky display
    const currentProduct = products[currentIndex];
    const currentPrice = currentProduct ? getProductPrice(currentProduct) : 0;

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

            {/* Sticky product text container */}
            {currentProduct && (
                <View style={styles.stickyProductContainer}>
                    <Text numberOfLines={1} style={styles.stickyProductText}>
                        {currentProduct.name} - ₹{currentPrice}
                    </Text>
                </View>
            )}

            {/* Sticky time container */}
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
                renderItem={({ item: product }) => {
                    return (
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
                            {/* Empty overlay for consistent layout */}
                            <View style={styles.productOverlay}>
                                <View style={styles.overlayRow}>
                                    {/* Content removed since it's now sticky outside */}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
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
                    <Text style={styles.topProductsText} numberOfLines={1}>
                        {topProductNames}
                    </Text>
                    <Text style={styles.storeAddress} numberOfLines={1}>
                        {store.address?.locality || store.address?.street},{" "}
                        {store.address?.city}
                    </Text>

                    <View style={styles.bottomRow}>
                        <Text style={styles.openText}>Open</Text>
                        {products[0]?.distance_in_km && (
                            <Text style={styles.distanceText}>
                                {products[0].distance_in_km.toFixed(1)} km
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default RestCard;
