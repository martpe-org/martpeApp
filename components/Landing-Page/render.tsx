import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  foodCategoryData,
  groceriesCategoryData,
} from "../../constants/categories";
import { Store2 } from "../../hook/fetch-home-type";
import { styles } from "./renderStyles";
import LikeButton from "../common/likeButton";
import OfferCard3 from "../Categories/OfferCard3";
import DiscountBadge from "../common/DiscountBadge"; // ✅ import
import { FlatList } from "react-native-gesture-handler";

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

// 🔹 Force 50% OFF everywhere with mock data
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
    value: storeData?.value || 100,
    maxPrice: storeData?.maxPrice || 200,
    discount: 50, // ✅ always 50% off
    calculated_max_offer: {
      percent: 50, // ✅ always 50% off
    },
    status: storeData?.status || "open",
    distance_in_km: storeData?.distance_in_km || 1.2,
    avg_tts_in_h: storeData?.avg_tts_in_h || 0.5,
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

  // 🔹 Special offers card
  const renderOfferCard = ({ item }: { item: Store2 }) => {
    const normalized = normalizeStoreData(item);

    return (
      <View style={{ marginRight: 16 }}>
        <OfferCard3 storeData={normalized} />
      </View>
    );
  };

// inside useRenderFunctions (render.tsx)
const RestaurantCarousel = ({ restaurants }: { restaurants: Store2[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get("window");
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Auto-scroll effect
  useEffect(() => {
    if (restaurants?.length > 1) {
      scrollInterval.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % restaurants.length;
        setActiveIndex(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 2000); // Scroll every 2 seconds
    }

    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    };
  }, [activeIndex, restaurants]);

  if (!restaurants?.length) return null;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={restaurants}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `restaurant-${item.slug}-${index}`}
        renderItem={({ item }) => {
          const normalized = normalizeStoreData(item);
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.restaurantCardCarousel, { width: width * 0.8 }]}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/home/result/productListing/[id]",
                  params: { id: normalized.slug },
                })
              }
            >
              {/* Background image */}
              <Image
                source={{
                  uri:
                    normalized.descriptor?.images?.[0] ||
                    normalized.symbol ||
                    "https://via.placeholder.com/300x180",
                }}
                style={styles.restaurantImageCarousel}
                resizeMode="cover"
              />

              {/* Gradient overlay */}
              <LinearGradient
                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
                style={styles.gradientOverlayCarousel}
              />

              {/* Text overlay */}
              <View style={styles.restaurantInfoOverlay}>
                <Text style={styles.restaurantNameOverlay} numberOfLines={1}>
                  {normalized.descriptor?.name ?? "Restaurant"}
                </Text>
                <Text style={styles.restaurantCuisineOverlay} numberOfLines={1}>
                  {normalized.store_sub_categories?.join(", ") ??
                    "Multi Cuisine"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        onMomentumScrollEnd={(ev) => {
          const index = Math.round(
            ev.nativeEvent.contentOffset.x / (width * 0.8)
          );
          setActiveIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: width * 0.8,
          offset: width * 0.8 * index,
          index,
        })}
        snapToInterval={width * 0.8}
        snapToAlignment="center"
        decelerationRate="fast"
      />

      {/* Pagination dots */}
      <View style={styles.carouselDotsContainer}>
        {restaurants.map((_, index) => (
          <View
            key={index}
            style={[
              styles.carouselDot,
              {
                backgroundColor:
                  activeIndex === index ? "#FF6B35" : "#ccc",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const renderRestaurantCarousel = (restaurants: Store2[]) => {
  if (!restaurants?.length) return null;
  
  return <RestaurantCarousel restaurants={restaurants} />;
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

          {/* 🔥 Offer badge (mocked 50%) */}
          <DiscountBadge
            percent={normalized.calculated_max_offer?.percent}
            style={styles.offerBadge}
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
            onPress={() =>
              router.push(`/(tabs)/home/result/${nextItem.name}`)
            }
            style={styles.categoryItem}
          >
            <Image source={{ uri: nextItem.image }} style={styles.categoryImage} />
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
            onPress={() =>
              router.push(`/(tabs)/home/result/${nextItem.name}`)
            }
            style={styles.categoryItem}
          >
            <Image source={{ uri: nextItem.image }} style={styles.categoryImage} />
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
    renderRestaurantCarousel,
    renderStores,
    renderFoodCategories,
    renderGroceryCategories,
  };
};

export default Render;
