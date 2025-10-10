import React from "react";
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LikeButton from "../../components/common/likeButton";
import OfferBadge from "../common/OfferBadge";
import { Store2 } from "../../hook/fetch-domain-type";
import ImageComp from "../common/ImageComp";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

interface Props {
    storeData: Store2;
    products: any[];
    hasOffer: boolean;
    calculated_max_offer?: any;
    vendorIdString: string;
    normalizedStoreData: any;
}

const RestCardImageSection: React.FC<Props> = ({
    storeData,
    products,
    hasOffer,
    calculated_max_offer,
    vendorIdString,
    normalizedStoreData,
}) => {
    const descriptor = storeData?.descriptor || {};
    const { symbol = "", images = [] } = descriptor;
    const bgImg = images?.[0] || symbol || "https://via.placeholder.com/400x200";

    return (
        <View style={styles.bannerContainer}>
            <TouchableOpacity activeOpacity={0.9}
                onPress={() =>
                    router.push(`/(tabs)/home/result/productListing/${storeData.slug}`)
                }
            >
                {/* 🌀 Carousel */}
                <Carousel
                    width={width - 20}
                    height={180}
                    autoPlay
                    autoPlayInterval={4000}
                    data={products.length > 0 ? products : [bgImg]}
                    scrollAnimationDuration={1000}
                    renderItem={({ item, index }) => {
                        const imageUri =
                            typeof item === "string"
                                ? item
                                : item?.symbol || item?.images?.[0] || bgImg;
                        const nameText = typeof item === "string" ? "" : item?.name || "";
                        const priceText =
                            typeof item === "string"
                                ? ""
                                : item?.price?.value ||
                                item?.price?.default_selection?.value ||
                                item?.price?.range?.lower ||
                                item?.priceRangeDefault ||
                                null;

                        return (
                            <View key={index}>
                                <ImageComp
                                    source={{ uri: imageUri }}
                                    imageStyle={styles.backgroundImage}
                                    resizeMode="cover"
                                />
                                {nameText ? (
                                    <View style={styles.overlayContainer}>
                                        <Text style={styles.overlayText} numberOfLines={1}>
                                            {nameText}
                                            {priceText ? ` - ₹${priceText}` : ""}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        );
                    }}
                />

                {/* 🎁 Offer Badge */}
                {hasOffer && (
                    <OfferBadge
                        offers={storeData?.offers || []}
                        maxStoreItemOfferPercent={
                            calculated_max_offer?.percent > 0
                                ? Math.round(calculated_max_offer.percent)
                                : undefined
                        }
                    />
                )}

                {/* ⏱️ Timer */}
                <View style={styles.timeBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
                    <Text style={styles.timeBadgeText}>45 mins</Text>
                </View>
            </TouchableOpacity>
            {/* ❤️ Like Button (no navigation) */}
            <View style={styles.topActions}>
                <LikeButton
                    vendorId={vendorIdString}
                    storeData={normalizedStoreData}
                    color="#E11D48"
                />
            </View>
        </View>
    );
};

export default RestCardImageSection;

const styles = StyleSheet.create({
    bannerContainer: {
        position: "relative",
    },
    backgroundImage: {
        width: "100%",
        height: 180,
    },
    overlayContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.55)",
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    overlayText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    timeBadge: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: "#22C55E",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    timeBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    topActions: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#fff",
        borderRadius: 50,
        padding: 5,
        elevation: 3,
    },
});
