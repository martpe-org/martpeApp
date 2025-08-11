import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchHome } from "../../../hook/fetch-home-data";
import useDeliveryStore from "../../../state/deliveryAddressStore";
import { Store2 } from "../../../hook/fetch-home-type";
import * as Location from 'expo-location';
import {
  categoryData,
  foodCategoryData,
  groceriesCategoryData,
  fashionCategoryData,
  personalCareCategoryData,
  electronicsCategoryData,
  homeAndDecorCategoryData,
} from "../../../constants/categories";
import { Ionicons, Entypo, FontAwesome6 } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const { selectedDetails, loadDeliveryDetails } = useDeliveryStore();

  // --- UI animation state (search placeholder) ---
  const searchTexts = ["grocery", "biryani", "clothing", "electronics"];
  const [searchTextIndex, setSearchTextIndex] = useState(0);
  const words = searchTexts[searchTextIndex].split(" ");
  const wordAnimations = useRef(words.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // animate words when index changes
    wordAnimations.forEach((anim) => anim.setValue(0));
    Animated.stagger(
      150,
      wordAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [searchTextIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchTextIndex((prev) => (prev + 1) % searchTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadDeliveryDetails();
  }, []);

  // --- local UI state used by render functions ---
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [restaurantsData, setRestaurantsData] = useState<Store2[]>([]);
  const [storesData, setStoresData] = useState<Store2[]>([]);

const {
  data: homeData,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: [
    "homeData",
    selectedDetails?.lat,
    selectedDetails?.lng,
    selectedDetails?.pincode,
  ],
  queryFn: async () => {
    let lat = selectedDetails?.lat;
    let lng = selectedDetails?.lng;
    let pin = selectedDetails?.pincode;

    // If no saved location, use device GPS
    if (!lat || !lng || !pin) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }
      const location = await Location.getCurrentPositionAsync({});
      lat = location.coords.latitude;
      lng = location.coords.longitude;

      // Optional: reverse geocode to get pincode
      const [address] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      pin = address.postalCode || "";
    }

    return fetchHome(lat, lng, pin);
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
  enabled: true,
  retry: 1,
});
// Animation value for "No Data" messages
const fadeAnim = useRef(new Animated.Value(0)).current;

// Animate when no data is found
useEffect(() => {
  if (homeData) {
    if ((!homeData.restaurants?.length) || (!homeData.stores?.length)) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0); // reset
    }
  }
}, [homeData]);

  // Sync query result to local state so existing UI (FlatLists) can use restaurantsData/storesData
  useEffect(() => {
    if (homeData) {
      setRestaurantsData(Array.isArray(homeData.restaurants) ? homeData.restaurants : []);
      setStoresData(Array.isArray(homeData.stores) ? homeData.stores : []);
    }
  }, [homeData]);

  // --- handlers ---
  const handleLocationPress = () => {
    router.push("../address/SavedAddresses");
  };

  const handleCategoryPress = (item: any) => {
    setActiveCategory(item.id?.toString?.() ?? item.id);
    router.push(`./categories/${item.link}`);
  };

  // --- render helpers (kept largely the same as your original) ---
  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.catCard,
        activeCategory === item.id && styles.catCardActive,
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      {/* item.image might be a local require or uri */}
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
        router.push(`/(tabs)/home/productListing/${item.provider_id}`)
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
          router.push(`/(tabs)/home/productListing/${item.provider_id}`)
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
  // --- Main render ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Red header */}
        <View style={styles.redSection}>
          <TouchableOpacity style={styles.locationRow} onPress={handleLocationPress}>
            <FontAwesome6 name="location-pin-lock" size={18} color="white" style={{ marginRight: 16 }} />
            <Text style={styles.deliveryTxt}>Delivering to</Text>
            <Text style={styles.locationTxt} numberOfLines={1}>
              {selectedDetails?.city || "Select Location"}
              {selectedDetails?.pincode ? `, ${selectedDetails.pincode}` : ""}
            </Text>
            <Entypo name="chevron-down" size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f2f2f2",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginHorizontal: 1,
              marginTop: 10,
            }}
            onPress={() => router.push("../search")}
            activeOpacity={0.9}
          >
            <Ionicons name="search" size={20} color="#555" style={{ marginRight: 8 }} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}>
              <Text style={{ color: "#8E8A8A", fontSize: 16 }}>Search for{" "}</Text>
              {words.map((word, idx) => (
                <Animated.Text
                  key={idx}
                  style={{
                    opacity: wordAnimations[idx],
                    transform: [
                      {
                        translateY: wordAnimations[idx].interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                    color: "#8E8A8A",
                    fontSize: 16,
                    marginRight: 4,
                  }}
                >
                  {word}
                </Animated.Text>
              ))}
            </View>
          </TouchableOpacity>

          <FlatList
            data={categoryData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.catList}
            renderItem={renderCategoryItem}
          />
        </View>

        {/* White content */}
        <View style={styles.whiteSection}>
        {isLoading && (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  )}

  {error && (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Something went wrong loading data.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  )}

  {/* Restaurants */}
  {restaurantsData.length > 0 ? (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Restaurants Near You</Text>
      </View>
      <FlatList
        data={restaurantsData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `restaurant_${item.provider_id}_${index}`}
        contentContainerStyle={styles.nearbyList}
        renderItem={renderRestaurantItem}
      />
    </View>
  ) : (
    !isLoading && (
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center", marginVertical: 20 }}>
        <Ionicons name="restaurant-outline" size={40} color="#999" />
        <Text style={{ fontSize: 16, color: "#555", marginTop: 8 }}>
          No restaurants found in your area
        </Text>
      </Animated.View>
    )
  )}

  {/* Stores */}
  {storesData.length > 0 ? (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Stores Near You</Text>
      </View>
      <FlatList
        data={storesData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `store_${item.provider_id}_${index}`}
        contentContainerStyle={styles.nearbyList}
        renderItem={renderNearbyItem}
      />
    </View>
  ) : (
    !isLoading && (
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center", marginVertical: 20 }}>
        <Ionicons name="storefront-outline" size={40} color="#999" />
        <Text style={{ fontSize: 16, color: "#555", marginTop: 8 }}>
          No stores found in your area
        </Text>
      </Animated.View>
    )
  )}
   {/* Groceries Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <View style={styles.headerLine} />
              <Text style={styles.sectionTitleCentered}>Groceries</Text>
              <View style={styles.headerLine} />
            </View>
            <FlatList
              data={groceriesCategoryData}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/(tabs)/home/result/[search]",
                      params: {
                        search: item.name,
                        domainData: "ONDC:RET10",
                      },
                    });
                  }}
                  style={styles.categoryItem}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.categoryImage}
                  />
                  <Text style={styles.categoryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              snapToAlignment="start"
              snapToInterval={windowWidth / 2}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* Explore Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <View style={styles.headerLine} />
              <Text style={styles.sectionTitleCentered}>
                Explore Food Categories
              </Text>
              <View style={styles.headerLine} />
            </View>
            <FlatList
              data={foodCategoryData}
              renderItem={renderFoodCategories}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              snapToAlignment="start"
              snapToInterval={windowWidth / 2}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* Grocery Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <View style={styles.headerLine} />
              <Text style={styles.sectionTitleCentered}>Fresh Groceries</Text>
              <View style={styles.headerLine} />
            </View>
            <FlatList
              data={groceriesCategoryData}
              renderItem={renderGroceryCategories}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              snapToAlignment="start"
              snapToInterval={windowWidth / 2}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* Fashion Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop for Fashion</Text>
            </View>
            <View style={styles.twoColumnGrid}>
              {fashionCategoryData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridCard,
                    index % 2 === 0
                      ? styles.gridCardLeft
                      : styles.gridCardRight,
                  ]}
                  onPress={() =>
                    router.push(`/(tabs)/home/result/${item.name}`)
                  }
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.gridCardImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.gridCardLabel}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Personal Care Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <View style={styles.headerLine} />
              <Text style={styles.sectionTitleCentered}>Personal Care</Text>
              <View style={styles.headerLine} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.personalCareContainer}>
                {personalCareCategoryData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.personalCareCard}
                    onPress={() => {
                      router.push({
                        pathname: "/(tabs)/home/result/[search]",
                        params: {
                          search: item.name,
                          domainData: "ONDC:RET10",
                        },
                      });
                    }}
                  >
                    <View style={styles.personalCareImageContainer}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.personalCareImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.personalCareTitle}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Electronics Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search for Electronics</Text>
            </View>
            <View style={styles.twoColumnGrid}>
              {electronicsCategoryData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridCard,
                    index % 2 === 0
                      ? styles.gridCardLeft
                      : styles.gridCardRight,
                  ]}
                  onPress={() =>
                    router.push(`/(tabs)/home/result/${item.name}`)
                  }
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.gridCardImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.gridCardLabel}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Home & Decor Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <View style={styles.headerLine} />
              <Text style={styles.sectionTitleCentered}>Home & Decor</Text>
              <View style={styles.headerLine} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.homeDecorContainer}>
                {homeAndDecorCategoryData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.homeDecorCard}
                    onPress={() => {
                      router.push({
                        pathname: "/(tabs)/home/result/[search]",
                        params: {
                          search: item.name,
                          domainData: "ONDC:RET10",
                        },
                      });
                    }}
                  >
                    <View style={styles.homeDecorImageContainer}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.homeDecorImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.homeDecorTitle}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                Only all-in-one marketplace
              </Text>
              <Text style={styles.headerSubtitle}>
                with <Text style={styles.greenText}>zero platform fees!</Text>
              </Text>
            </View>

            {/* Main Image */}
            <View style={styles.imageContainer}>
              <Image
                source={require("../../../assets/tabs/footer.webp")} // Replace with your local image path
                style={styles.mainImage}
                resizeMode="cover"
              />
            </View>

            {/* Feature Cards */}
            <View style={styles.cardsContainer}>
              <View style={styles.cardRow}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Zero Platform</Text>
                  <Text style={styles.cardTitle}>Fees</Text>
                  <Text style={styles.cardDescription}>
                    Enjoy shopping without any additional fees.
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>6 Categories</Text>
                  <Text style={styles.cardDescription}>
                    Currently offering grocery, food, interior, electronics,
                    personal care, and home decor.
                  </Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>5 Lakh+ Sellers</Text>
                  <Text style={styles.cardDescription}>
                    Items curated from over 5 lakh sellers across India.
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Monetize Your</Text>
                  <Text style={styles.cardTitle}>Experience</Text>
                  <Text style={styles.cardDescription}>
                    Turn your shopping into rewarding experiences.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7c5462",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  redSection: {
    backgroundColor: "#ff3c41",
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryTxt: {
    color: "white",
    fontSize: 14,
    marginHorizontal: 6,
    marginLeft: -12,
  },
  locationTxt: {
    color: "white",
    fontSize: 14,
    marginRight: 4,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#555",
  },
  catList: {
    marginTop: 5,
  },
  catCard: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    width: 46,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  catCardActive: {
    backgroundColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  whiteSection: {
    backgroundColor: "#f5f2f2",
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  sectionHeaderWithLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sectionTitleCentered: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5A5555",
    marginHorizontal: 15,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#5A5555",
  },
  categoryList: {
    alignItems: "center",
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
  // Two Column Grid Styles
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  gridCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridCardLeft: {
    marginRight: "2%",
  },
  gridCardRight: {
    marginLeft: "2%",
  },
  gridCardImage: {
    width: "100%",
    height: 120,
  },
  gridCardLabel: {
    padding: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  // Personal Care Section
  personalCareContainer: {
    flexDirection: "row",
    paddingLeft: 1,
  },
  personalCareCard: {
    marginRight: 12,
    alignItems: "center",
    marginTop: 10,
  },
  personalCareImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  personalCareImage: {
    width: 50,
    height: 50,
  },
  personalCareTitle: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 80,
  },
  // Home & Decor Section
  homeDecorContainer: {
    flexDirection: "row",
    paddingLeft: 16,
  },
  homeDecorCard: {
    marginRight: 12,
    alignItems: "center",
    marginTop: 14,
  },
  homeDecorImageContainer: {
    width: 200,
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 10,
  },
  homeDecorImage: {
    width: 200,
    height: 150,
  },
  homeDecorTitle: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 90,
  },
  // Footer Section
 footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB', // Blue color
    textAlign: 'center',
    lineHeight: 28,
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 28,
  },
  greenText: {
    color: '#10B981', // Green color
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  cardsContainer: {
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#Ffff',
    padding: 15,
    borderRadius: 12,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 20,
    marginHorizontal: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  nearbyListContainer: {
    paddingHorizontal: 16,
  },
  nearbyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nearbyLocation: {
    color: "#706F6F",
    fontSize: 11,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  nearbyList: {
    paddingHorizontal: 0,
    paddingVertical: 8,
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
  timeBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  timeBadgeText: {
    color: "white",
    fontSize: 10,
    marginLeft: 2,
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
  nearbyAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  nearbyBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  nearbyDistance: {
    fontSize: 12,
    color: "#FF9130",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF9130",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    marginBottom: 8,
  },

  // Restaurant Card Styles
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
});