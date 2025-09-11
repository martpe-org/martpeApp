import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; // ✅ Add this import
import {
  foodCategoryData,
  groceriesCategoryData,
} from "../../constants/categories";
import { Store2 } from "../../hook/fetch-home-type";

const windowWidth = Dimensions.get("window").width;

export const useRenderFunctions = () => {
  const router = useRouter();

  const handleCategoryPress = (item: any) => {
    router.push(`../../(tabs)/home/categories/${item.link}`);
  };

  // Compact version for smaller screens or different layouts
  const renderCategoryItemCompact = ({ item, index }: { item: any; index?: number }) => (
    <TouchableOpacity
      style={[
        styles.catCardCompact,
        { marginLeft: index === 0 ? -10: 0 }
      ]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.iconImgCompact} />
      <Text style={styles.catLabelCompact} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // ✅ Updated restaurant card with linear gradient and store card sizing
  const renderRestaurantItem = ({ item }: { item: Store2 }) => (
    <TouchableOpacity
      style={styles.restaurantCardCompact} // ✅ New compact style
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
        {/* ✅ Linear gradient overlay */}
        <LinearGradient
          colors={['rgba(255,107,53,0.1)', 'rgba(255,152,48,0.05)']} // Subtle orange gradient
          style={styles.gradientOverlay}
        />
        {item.offers && item.offers.length > 0 && (
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
                {
                  backgroundColor:
                    item.status === "open" ? "#00C851" : "green",
                },
              ]}
            />
            <Text
              style={[
                styles.restaurantStatusTextCompact,
                { color: item.status === "open" ? "#00C851" : "#00C851" },
              ]}
            >
              Open
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStores = ({ item }: { item: Store2 }) => {
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
      <TouchableOpacity
        style={styles.nearbyCard}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/productListing/[id]",
            params: { id: item.slug },
          })
        }
      >
        <View style={styles.nearbyImageContainer}>
          <Image
            source={{
              uri: item.symbol || "https://via.placeholder.com/120x80",
            }}
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
          {distance !== "" && (
            <Text style={styles.nearbyDistance}>{distance}</Text>
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
    renderRestaurantItem,
    renderStores,
    renderFoodCategories,
    renderGroceryCategories,
  };
};

const styles = StyleSheet.create({
  // ✅ New compact restaurant card styles (similar to store card size)
  restaurantCardCompact: {
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
    width: 200, // Same as nearbyCard width
    overflow: "hidden",
  },
  restaurantImageContainerCompact: {
    position: "relative",
    width: "100%",
    height: 120, // Same as nearbyImage height
    backgroundColor: "#f5f5f5",
  },
  restaurantImageCompact: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  // ✅ Linear gradient overlay for restaurants
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantOfferBadgeCompact: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  restaurantOfferTextCompact: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  restaurantTimeBadgeCompact: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  restaurantTimeTextCompact: {
    color: "white",
    fontSize: 10,
    marginLeft: 2,
    fontWeight: "500",
  },
  restaurantInfoCompact: {
    padding: 12, // Same as nearbyInfo padding
  },
  restaurantNameCompact: {
    fontSize: 16, // Same as nearbyName
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  restaurantCuisineCompact: {
    fontSize: 12, // Same as nearbyCategory
    color: "#888",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  restaurantBottomRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restaurantDeliveryTimeCompact: {
    fontSize: 12,
    color: "#FF9130", // Orange color like nearbyDistance
    fontWeight: "500",
  },
  restaurantStatusCompact: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantStatusDotCompact: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  restaurantStatusTextCompact: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Original restaurant card styles (keeping for backward compatibility)
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
    width: 200,
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

  // Store card styles (unchanged)
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
  catCard: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    width: 46,
    borderRadius: 8,
    backgroundColor: "transparent",
    paddingVertical: 8,
  },
  imageContainer: {
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 20,
  },
  iconImg: {
    width: 45,
    height: 40,
    resizeMode: "contain",
    borderRadius: 8,
  },
  catLabel: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Compact version styles
  catCardCompact: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    width: 50,
    borderRadius: 8,
    backgroundColor: "transparent",
    paddingVertical: 6,
  },
  iconImgCompact: {
    width: 40,
    height: 36,
    resizeMode: "contain",
    borderRadius: 6,
    marginBottom: 2,
  },
  catLabelCompact: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: -7
  },
});
