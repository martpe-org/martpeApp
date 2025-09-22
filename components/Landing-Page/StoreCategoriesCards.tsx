import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Store2 } from "../../hook/fetch-home-type";
import LikeButton from "../common/likeButton";
import OfferBadge from "../common/OfferBadge";
import {
  foodCategoryData,
  groceriesCategoryData,
} from "../../constants/categories";
import { normalizeStoreData } from "./render";
import { Ionicons } from "@expo/vector-icons";

interface StoreCardProps {
  item: Store2;
}

interface CategoryItemProps {
  item: any;
  index?: number;
}

interface CategoryRowProps {
  item: any;
  index: number;
}
  const getLocationText = (storeData: Store2) => {
    const { address } = storeData;
    if (address.locality && address.city) {
      return `${address.locality}, ${address.city}`;
    } else if (address.locality) {
      return address.locality;
    } else if (address.city) {
      return address.city;
    } else if (address.street) {
      return address.street;
    } else if (address.name) {
      return address.name;
    }
    return "Location not available";
  };

const windowWidth = Dimensions.get("window").width;

export const StoreCard: React.FC<StoreCardProps> = ({ item }) => {
  const router = useRouter();
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

        <OfferBadge
          offers={normalized.offers}
          maxStoreItemOfferPercent={normalized.maxStoreItemOfferPercent}
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
                      {/* Restaurant Location using Store2 address */}
        <View style={styles.restaurantLocationContainer}>
          <Ionicons name="location-outline" size={10} color="#222" marginBottom="5"/>
          <Text style={styles.restaurantLocationCompact} numberOfLines={1}>
            {getLocationText(item)}
          </Text>
        </View>
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

export const CategoryItemCompact: React.FC<CategoryItemProps> = ({ 
  item, 
  index 
}) => {
  const router = useRouter();

  const handleCategoryPress = (categoryItem: any) => {
    router.push(`../../(tabs)/home/categories/${categoryItem.link}`);
  };

  return (
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
};

export const FoodCategoryRow: React.FC<CategoryRowProps> = ({ item, index }) => {
  const router = useRouter();

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

export const GroceryCategoryRow: React.FC<CategoryRowProps> = ({ item, index }) => {
  const router = useRouter();

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

const styles = StyleSheet.create({
  // Store card styles
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
    restaurantLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  restaurantLocationCompact: {
    fontSize: 11,
    color: "#050505",
    fontWeight: "400",
    marginLeft: 4,
    flex: 1,
    marginBottom:5
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
  topActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
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
  restaurantStatusCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 4,
  },
  restaurantStatusDotCompact: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  restaurantStatusTextCompact: {
    fontSize: 12,
    fontWeight: "600",
  },
  
  // Category styles
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
  
  // Compact category styles
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
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: -7,
  },
});