import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  foodCategoryData,
  groceriesCategoryData,
} from "../../constants/categories";
import { Store2 } from "../../hook/fetch-home-type";
import { styles } from "./renderStyles";
import LikeButton from "../common/likeButton";

interface StoreCard3Props {
  storeData: any;
  categoryFiltered: any[];
  userLocation: { lat: number; lng: number };
}

// ✅ Keep StoreCard3 minimal
const StoreCard3: React.FC<StoreCard3Props> = ({ storeData }) => {
  if (!storeData) return null;

  const {
    descriptor = {},
    address = {},
    calculated_max_offer = {},
    geoLocation = {},
  } = storeData;

  return (
    <View>
      {/* Example usage – You can use render functions from useRenderFunctions */}
      <Text>{descriptor?.name ?? "Unnamed Store"}</Text>
    </View>
  );
};

// ✅ Hook with render functions
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

  // ✅ normalized store data
  const normalizeStoreData = (storeData: any) => {
    const vendorIdString = storeData?.slug || storeData?.id || "";

    return {
      id: vendorIdString,
      slug: vendorIdString,
      descriptor: {
        name: storeData?.descriptor?.name || "Unknown Store",
        short_desc: storeData?.descriptor?.short_desc || "",
        description: storeData?.descriptor?.description || "",
        images: storeData?.descriptor?.images || [],
        symbol: storeData?.descriptor?.symbol || "",
        ...storeData?.descriptor,
      },
      symbol: storeData?.symbol || "",
      address: storeData?.address || {},
      geoLocation: storeData?.geoLocation || {},
      calculated_max_offer: storeData?.calculated_max_offer || {},
      ...storeData,
         id: vendorIdString,
      slug: vendorIdString,
    };
  };

const renderRestaurantItem = ({ item }: { item: Store2 }) => {
  const vendorIdString = item?.slug || item?.id || "";
  const normalizedStoreData = {
    id: vendorIdString,
    slug: vendorIdString,
    descriptor: {
      name: item?.name || "Unknown Restaurant",
      short_desc: item?.descriptor?.short_desc || "",
      description: item?.descriptor?.description || "",
      images: item?.descriptor?.images || [],
      symbol: item?.symbol || "",
      ...item?.descriptor,
    },
    symbol: item?.symbol || "",
    address: item?.address || {},
    geoLocation: item?.geoLocation || {},
    calculated_max_offer: item?.calculated_max_offer || {},
    ...item,
  };

  return (
    <TouchableOpacity
      style={styles.restaurantCardCompact}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/home/result/productListing/[id]",
          params: { id: item.slug },
        })
      }
    >
      <View style={styles.restaurantImageContainerCompact}>
        <Image
          source={{
            uri: item.symbol || "https://via.placeholder.com/120x80",
          }}
          style={styles.restaurantImageCompact}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(255,107,53,0.1)", "rgba(255,152,48,0.05)"]}
          style={styles.gradientOverlay}
        />

        {/* ✅ Like Button added here */}
        <View style={styles.topActions}>
          <LikeButton
            vendorId={vendorIdString}
            storeData={normalizedStoreData}
            color="#E11D48"
          />
        </View>

        {item.offers?.length > 0 && (
          <View style={styles.restaurantOfferBadgeCompact}>
            <Text style={styles.restaurantOfferTextCompact}>
              {item.maxStoreItemOfferPercent ?? "20"}% OFF
            </Text>
          </View>
        )}
        {item.avg_tts_in_h && (
          <View style={styles.restaurantTimeBadgeCompact}>
            <Ionicons name="time-outline" size={8} color="white" />
            <Text style={styles.restaurantTimeTextCompact}>
              {Math.round(item.avg_tts_in_h * 60)} min
            </Text>
          </View>
        )}
      </View>

      <View style={styles.restaurantInfoCompact}>
        <Text style={styles.restaurantNameCompact} numberOfLines={1}>
          {item.name ?? "Unknown Restaurant"}
        </Text>
        <Text style={styles.restaurantCuisineCompact} numberOfLines={1}>
          {item.store_sub_categories?.join(", ") ?? "Multi Cuisine"}
        </Text>

        <View style={styles.restaurantBottomRowCompact}>
          <Text style={styles.restaurantDeliveryTimeCompact}>
            {item.avg_tts_in_h
              ? `${Math.round(item.avg_tts_in_h * 60)} mins`
              : "30-40 mins"}
          </Text>
          <View style={styles.restaurantStatusCompact}>
            <View
              style={[
                styles.restaurantStatusDotCompact,
                { backgroundColor: item.status === "open" ? "#00C851" : "green" },
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
      </View>
    </TouchableOpacity>
  );
};


  const renderStores = ({ item }: { item: Store2 }) => {
    const vendorIdString = item?.slug || item?.id || "";
    const normalizedStoreData = normalizeStoreData(item);

    const title = item.store_name || item.name || "Unnamed";
    const category =
      item.store_sub_categories?.join(", ") ||
      item.domain?.replace("ONDC:", "") ||
      (item.type === "restaurant" ? "Restaurant" : "Store");
    const distance =
      typeof item.distance_in_km === "number"
        ? `${item.distance_in_km.toFixed(1)} km`
        : "";

    return (
      <View
        style={styles.nearbyCard}

      >
        <View style={styles.nearbyImageContainer}>
          <Image
            source={{
              uri: item.symbol || "https://via.placeholder.com/120x80",
            }}
            style={styles.nearbyImage}
            resizeMode="cover"
          />

          {item.offers?.length > 0 && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>
                UPTO {item.maxStoreItemOfferPercent ?? "50"}% OFF
              </Text>
            </View>
          )}

          {/* Floating actions */}
          <View style={styles.topActions}>
            <LikeButton
              vendorId={vendorIdString}
              storeData={normalizedStoreData}
              color="#E11D48"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.nearbyInfo}
                onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/productListing/[id]",
            params: { id: item.slug },
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
              { backgroundColor: item.status === "open" ? "#00C851" : "green" },
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

  const renderFoodCategories = ({ item, index }: { item: any; index: number }) => {
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
            onPress={() => router.push(`/(tabs)/home/result/${nextItem.name}`)}
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
    renderRestaurantItem,
    renderStores,
    renderFoodCategories,
    renderGroceryCategories,
  };
};

export default StoreCard3;
