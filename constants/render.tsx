import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Store2 } from "../hook/fetch-home-type";
import {
  foodCategoryData,
  groceriesCategoryData,
} from "../constants/categories";
import { Ionicons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;

export const useRenderFunctions = () => {
  const router = useRouter();

  const handleCategoryPress = (item: any) => {
    router.push(`../../(tabs)/home/categories/${item.link}`);
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.catCard}
      onPress={() => handleCategoryPress(item)}
    >
      <Image source={item.image} style={styles.iconImg} />
      <Text style={styles.catLabel} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderRestaurantItem = ({ item }: { item: Store2 }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() =>
  router.push(`/(tabs)/home/result/productListing/${item.slug}`)
      }
    >
      <View style={styles.restaurantImageContainer}>
        <Image
          source={{
            uri: item.symbol || "https://via.placeholder.com/150x100",
          }}
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        {item.offers && item.offers.length > 0 && (
          <View style={styles.restaurantOfferBadge}>
            <Text style={styles.restaurantOfferText}>
              {item.maxStoreItemOfferPercent ?? "20"}% OFF
            </Text>
          </View>
        )}
        {item.avg_tts_in_h && (
          <View style={styles.restaurantTimeBadge}>
            <Ionicons name="time-outline" size={10} color="white" />
            <Text style={styles.restaurantTimeText}>
              {Math.round(item.avg_tts_in_h * 60)} min
            </Text>
          </View>
        )}
      </View>

      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.name ?? "Unknown Restaurant"}
        </Text>
        <Text style={styles.restaurantCuisine} numberOfLines={1}>
          {item.store_sub_categories?.join(", ") ?? "Multi Cuisine"}
        </Text>

        <View style={styles.restaurantDetailsRow}>
          <View style={styles.restaurantRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.restaurantRatingText}>
              {typeof item.rating === "number" ? item.rating.toFixed(1) : "4.2"}
            </Text>
          </View>

          <Text style={styles.restaurantDeliveryTime}>
            {item.avg_tts_in_h ? `${Math.round(item.avg_tts_in_h * 60)} mins` : "30-40 mins"}
          </Text>
        </View>

        <View style={styles.restaurantBottomRow}>
          <Text style={styles.restaurantLocation} numberOfLines={1}>
            {item.address?.locality || item.address?.city || "Local Area"}
          </Text>
          <View style={styles.restaurantStatus}>
            <View
              style={[
                styles.restaurantStatusDot,
                { backgroundColor: item.status === "open" ? "#00C851" : "#FF4444" },
              ]}
            />
            <Text
              style={[
                styles.restaurantStatusText,
                { color: item.status === "open" ? "#00C851" : "#FF4444" },
              ]}
            >
              {item.status === "open" ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNearbyItem = ({ item }: { item: Store2 }) => {
    const title = item.store_name || item.name || "Unnamed";
    const category =
      item.store_sub_categories?.join(", ") ||
      item.domain?.replace("ONDC:", "") ||
      (item.type === "restaurant" ? "Restaurant" : "Store");
    const distance =
      typeof item.distance_in_km === "number" ? `${item.distance_in_km.toFixed(1)} km` : "";
    const rating = typeof item.rating === "number" && !isNaN(item.rating) ? item.rating.toFixed(1) : null;

    return (
      <TouchableOpacity
        style={styles.nearbyCard}
        onPress={() =>
  router.push(`/(tabs)/home/result/productListing/${item.slug}`)
        }
      >
        <View style={styles.nearbyImageContainer}>
          <Image
            source={{ uri: item.symbol || "https://via.placeholder.com/120x80" }}
            style={styles.nearbyImage}
            resizeMode="cover"
          />
          {item.offers && item.offers.length > 0 && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>
                UPTO {item.maxStoreItemOfferPercent ?? "50"}% OFF
              </Text>
            </View>
          )}
        </View>

        <View style={styles.nearbyInfo}>
          <Text style={styles.nearbyName} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.nearbyCategory} numberOfLines={1}>
            {category}
          </Text>
          {distance !== "" && <Text style={styles.nearbyDistance}>{distance}</Text>}
          {rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
          onPress={() => router.push(`../../(tabs)/home/result/${item.name}`)}
          style={styles.categoryItem}
        >
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
        {nextItem && (
          <TouchableOpacity
            onPress={() => router.push(`../../(tabs)/home/result/${nextItem.name}`)}
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
    renderCategoryItem,
    renderRestaurantItem,
    renderNearbyItem,
    renderFoodCategories,
    renderGroceryCategories,
  };
};

const styles = StyleSheet.create({
  catCard: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    width: 46,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  iconImg: {
    width: 45,
    height: 40,
    resizeMode: "contain",
  },
  catLabel: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  restaurantCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    width: 260,
    overflow: "hidden",
  },
  restaurantImageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    backgroundColor: "#f8f8f8",
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  restaurantOfferBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  restaurantOfferText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  restaurantTimeBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantTimeText: {
    color: "white",
    fontSize: 11,
    marginLeft: 3,
    fontWeight: "600",
  },
  restaurantInfo: {
    padding: 14,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 13,
    color: "#7A7A7A",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  restaurantDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  restaurantRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00A651",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  restaurantRatingText: {
    fontSize: 13,
    color: "white",
    marginLeft: 3,
    fontWeight: "600",
  },
  restaurantDeliveryTime: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  restaurantBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restaurantLocation: {
    fontSize: 12,
    color: "#8A8A8A",
    flex: 1,
    marginRight: 8,
  },
  restaurantStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  restaurantStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  nearbyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 200,
    overflow: "hidden",
  },
  nearbyImageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f5",
  },
  nearbyImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF9130",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offerBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  nearbyInfo: {
    padding: 12,
  },
  nearbyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  nearbyCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  nearbyDistance: {
    fontSize: 12,
    color: "#FF9130",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  categoryRow: {
    margin: 5,
    flexDirection: "column",
    alignItems: "center",
  },
  categoryItem: {
    margin: 5,
    flexDirection: "column",
    alignItems: "center",
  },
  categoryImage: {
    width: windowWidth * 0.2,
    height: windowWidth * 0.24,
    resizeMode: "contain",
  },
  categoryName: {
    marginTop: -9,
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});