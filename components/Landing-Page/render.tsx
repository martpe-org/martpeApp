import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  foodCategoryData,
  groceriesCategoryData,
} from "../../constants/categories";
import { Store2, HomeOfferType } from "../../hook/fetch-home-type";
import { styles } from "./renderStyles";
import LikeButton from "../common/likeButton";
import DiscountBadge from "../common/DiscountBadge";
import HomeOfferCard from "./HomeOfferCard";

interface renderProps {
  storeData: any;
  categoryFiltered: any[];
  userLocation: { lat: number; lng: number };
}

const Render: React.FC<renderProps> = ({ storeData }) => {
  if (!storeData) return null;

  const { descriptor = {} } = storeData;

  return (
    <View>
      <Text>{descriptor?.name ?? "Unnamed Store"}</Text>
    </View>
  );
};

// 🔹 Normalized store interface
export interface NormalizedStore {
  id: string;
  slug: string;
  descriptor: {
    name: string;
    short_desc?: string;
    description?: string;
    images?: string[];
    symbol?: string;
  };
  symbol: string;
  value?: number;
  maxPrice?: number;
  discount?: number;
  calculated_max_offer: { percent: number };
  status?: string;
  distance_in_km?: number;
  avg_tts_in_h?: number;
  store_sub_categories?: string[];
  store_name?: string;
  domain?: string;
  type?: string;
}

export const normalizeStoreData = (storeData: any): NormalizedStore => {
  const vendorIdString = storeData?.slug || storeData?.id || "";

  return {
    id: vendorIdString,
    slug: vendorIdString,
    descriptor: {
      name:
        storeData?.descriptor?.name ||
        storeData?.store_name ||
        storeData?.name ||
        "Unnamed Store",
      short_desc: storeData?.descriptor?.short_desc || "",
      description: storeData?.descriptor?.description || "",
      images: storeData?.descriptor?.images || [],
      symbol: storeData?.descriptor?.symbol || "",
    },
    symbol: storeData?.symbol || "",
    value: storeData?.value ?? 100,
    maxPrice: storeData?.maxPrice ?? 200,

    // ✅ Prefer backend discount/offer if available, fallback otherwise
    discount:
      storeData?.discount ?? storeData?.calculated_max_offer?.percent ?? 0,
    calculated_max_offer: {
      percent: storeData?.calculated_max_offer?.percent ?? 0,
    },

    status: storeData?.status || "open",
    distance_in_km: storeData?.distance_in_km ?? 1.2,
    avg_tts_in_h: storeData?.avg_tts_in_h ?? 0.5,
    store_sub_categories: storeData?.store_sub_categories || ["Mock Category"],
    store_name:
      storeData?.store_name ||
      storeData?.descriptor?.name ||
      storeData?.name ||
      "Unnamed Store",
    domain: storeData?.domain || "ONDC:retail",
    type: storeData?.type || "store",
  };
};

export const useRenderFunctions = () => {
  const router = useRouter();

  const handleCategoryPress = (item: any) => {
    router.push(`../../(tabs)/home/categories/${item.link}`);
  };

  const renderCategoryItemCompact = ({
    item,
    index,
  }: {
    item: any;
    index?: number;
  }) => (
    <TouchableOpacity
      style={[styles.catCardCompact, { marginLeft: index === 0 ? -10 : 0 }]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.iconImgCompact} />
      <Text style={styles.catLabelCompact} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // 🔹 Special offers card (uses HomeOfferCard.tsx)
  const renderOfferCard = ({
    item,
    index,
  }: {
    item: HomeOfferType;
    index: number;
  }) => {
    return (
      <View style={{ marginRight: 16 }}>
        <HomeOfferCard offerItem={item} index={index} />
      </View>
    );
  };

  // 🔹 Restaurants
  const renderRestaurantItem = ({ item }: { item: Store2 }) => {
    const normalized = normalizeStoreData(item);
    const vendorIdString = normalized.slug;

    return (
      <View style={styles.restaurantCardCompact}>
        <View style={styles.restaurantImageContainerCompact}>
          <Image
            source={{
              uri: normalized.symbol || "https://via.placeholder.com/120x80",
            }}
            style={styles.restaurantImageCompact}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(255,107,53,0.1)", "rgba(255,152,48,0.05)"]}
            style={styles.gradientOverlay}
          />

          {/* ❤️ Like button */}
          <View style={styles.topActions}>
            <LikeButton
              vendorId={vendorIdString}
              storeData={normalized}
              color="#E11D48"
            />
          </View>

          {/* 🔥 Offer badge */}
          <DiscountBadge
            percent={normalized.calculated_max_offer.percent}
            style={styles.restaurantOfferBadgeCompact}
          />

          {normalized.avg_tts_in_h && (
            <View style={styles.restaurantTimeBadgeCompact}>
              <Ionicons name="time-outline" size={8} color="white" />
              <Text style={styles.restaurantTimeTextCompact}>
                {Math.round(normalized.avg_tts_in_h * 60)} min
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.restaurantInfoCompact}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/home/result/productListing/[id]",
              params: { id: normalized.slug },
            })
          }
        >
          <Text style={styles.restaurantNameCompact} numberOfLines={1}>
            {normalized.descriptor?.name ?? "Unknown Restaurant"}
          </Text>
          <Text style={styles.restaurantCuisineCompact} numberOfLines={1}>
            {normalized.store_sub_categories?.join(", ") ?? "Multi Cuisine"}
          </Text>

          <View style={styles.restaurantBottomRowCompact}>
            <Text style={styles.restaurantDeliveryTimeCompact}>
              {normalized.avg_tts_in_h
                ? `${Math.round(normalized.avg_tts_in_h * 60)} mins`
                : "30-40 mins"}
            </Text>
            <View style={styles.restaurantStatusCompact}>
              <View
                style={[
                  styles.restaurantStatusDotCompact,
                  {
                    backgroundColor:
                      normalized.status === "open" ? "#00C851" : "green",
                  },
                ]}
              />
              <Text
                style={[
                  styles.restaurantStatusTextCompact,
                  { color: "#00C851" },
                ]}
              >
                Open
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // 🔹 Stores
  const renderStores = ({ item }: { item: Store2 }) => {
    const normalized = normalizeStoreData(item);
    const vendorIdString = normalized.slug;

    const title =
      normalized.store_name || normalized.descriptor?.name || "Unnamed";
    const category =
      normalized.store_sub_categories?.join(", ") ||
      normalized.domain?.replace("ONDC:", "") ||
      (normalized.type === "restaurant" ? "Restaurant" : "Store");
    const distance =
      typeof normalized.distance_in_km === "number"
        ? `${normalized.distance_in_km.toFixed(1)} km`
        : "";

    return (
      <View style={styles.nearbyCard}>
        <View style={styles.nearbyImageContainer}>
          <Image
            source={{
              uri: normalized.symbol || "https://via.placeholder.com/120x80",
            }}
            style={styles.nearbyImage}
            resizeMode="cover"
          />

          {/* 🔥 Offer badge */}
          <DiscountBadge
            percent={normalized.calculated_max_offer.percent}
            style={styles.restaurantOfferBadgeCompact}
          />

          <View style={styles.topActions}>
            <LikeButton
              vendorId={vendorIdString}
              storeData={normalized}
              color="#E11D48"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.nearbyInfo}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/home/result/productListing/[id]",
              params: { id: normalized.slug },
            })
          }
        >
          <Text style={styles.nearbyName} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.nearbyCategory} numberOfLines={1}>
            {category}
          </Text>
          {distance !== "" && (
            <Text style={styles.nearbyDistance}>{distance}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.restaurantStatusCompact}>
          <View
            style={[
              styles.restaurantStatusDotCompact,
              {
                backgroundColor:
                  normalized.status === "open" ? "#00C851" : "green",
              },
            ]}
          />
          <Text
            style={[styles.restaurantStatusTextCompact, { color: "#00C851" }]}
          >
            Open
          </Text>
        </View>
      </View>
    );
  };

  // 🔹 Categories (unchanged)
  const renderFoodCategories = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    if (index % 2 !== 0) return null;
    const nextItem = foodCategoryData[index + 1];

    return (
      <View style={styles.categoryRow}>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/home/result/${item.name}`)}
          style={styles.categoryItem}
        >
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
        {nextItem && (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/home/result/${nextItem.name}`)}
            style={styles.categoryItem}
          >
            <Image
              source={{ uri: nextItem.image }}
              style={styles.categoryImage}
            />
            <Text style={styles.categoryName}>{nextItem.name}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderGroceryCategories = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    if (index % 2 !== 0) return null;
    const nextItem = groceriesCategoryData[index + 1];

    return (
      <View style={styles.categoryRow}>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/home/result/${item.name}`)}
          style={styles.categoryItem}
        >
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
        {nextItem && (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/home/result/${nextItem.name}`)}
            style={styles.categoryItem}
          >
            <Image
              source={{ uri: nextItem.image }}
              style={styles.categoryImage}
            />
            <Text style={styles.categoryName}>{nextItem.name}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return {
    handleCategoryPress,
    renderCategoryItemCompact,
    renderOfferCard,
    renderRestaurantItem,
    renderStores,
    renderFoodCategories,
    renderGroceryCategories,
  };
};

export default Render;
