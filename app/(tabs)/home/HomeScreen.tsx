import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  categoryData,
  foodCategoryData,
  groceriesCategoryData,
  fashionCategoryData,
  personalCareCategoryData,
  electronicsCategoryData,
  homeAndDecorCategoryData,
  // Import stores data
} from "../../../constants/categories";
import { Animated } from "react-native";
import { fetchHome } from "../../../hook/fetch-home-data";
import { fetchHomeByDomain } from "../../../hook/fetch-domain-data";
import { FetchHomeType, Store2 } from "../../../hook/fetch-home-type";
import {
  FetchDomainType,
  Store2 as DomainStore2,
} from "../../../hook/fetch-domain-type";
import * as Location from "expo-location";
import { Ionicons, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useDeliveryStore from "../../../state/deliveryAddressStore";
import OfferCard from "../../../components/Landing Page/OfferCard";
import { getAddress } from "../../../utility/location";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const HomeScreen = () => {
  const router = useRouter();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const addDeliveryDetail = useDeliveryStore(
    (state) => state.addDeliveryDetail
  );

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [homeData, setHomeData] = useState<FetchHomeType | null>(null);
  const [restaurantDomainData, setRestaurantDomainData] =
    useState<FetchDomainType | null>(null);
  const [storeDomainData, setStoreDomainData] =
    useState<FetchDomainType | null>(null);
  const [isLoadingHomeData, setIsLoadingHomeData] = useState(false);
  const [restaurantsData, setRestaurantsData] = useState<DomainStore2[]>([]);
  const [storesData, setStoresData] = useState<DomainStore2[]>([]);

  const searchTexts = ["grocery", "biryani", "clothing", "electronics"];
  const [searchTextIndex, setSearchTextIndex] = useState(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchTextIndex((prevIndex) => (prevIndex + 1) % searchTexts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollAnim.setValue(0);
    Animated.timing(scrollAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  }, [searchTextIndex]);

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -10], // Scrolls upward by 40 units
  });

  useEffect(() => {
    async function initHomePage() {
      await askForLocationPermissions();
    }
    initHomePage();
  }, []);

  const askForLocationPermissions = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      setLocation(location);
    } catch (error) {
      console.error(
        "Error during the location permission and fetching:",
        error
      );
    }
  };

  const getCityName = async (
    latitude: number,
    longitude: number
  ): Promise<void> => {
    try {
      const response = await getAddress(latitude, longitude);
      const address = response?.data?.items[0]?.address;
      addDeliveryDetail({
        addressId: null,
        city: address?.city || null,
        state: address?.state || null,
        fullAddress: `${address?.street || ""}, ${address?.city || ""}, ${
          address?.postalCode || ""
        }`,
        name: "Current Location",
        isDefault: false,
        pincode: address?.postalCode || null,
        lat: latitude,
        lng: longitude,
        streetName: address?.street || null,
      });
    } catch (error) {
      console.error("Error during geocoding with API:", error);
    }
  };

  const getUserLocationDetails = async (): Promise<void> => {
    try {
      if (!location) return;
      const { latitude, longitude } = location?.coords || {};
      await getCityName(latitude, longitude);
    } catch (error) {
      console.error(`Error in fetching the user location details`, error);
    }
  };

  // Fetch home data when location and delivery details are available
  const fetchHomeData = async (): Promise<void> => {
    if (!location || !selectedDetails?.pincode) return;

    setIsLoadingHomeData(true);
    try {
      const { latitude, longitude } = location.coords;

      // Fetch restaurants from Food & Beverage domain
      const restaurantData = await fetchHomeByDomain(
        latitude,
        longitude,
        selectedDetails.pincode,
        "ONDC:RET10", // Food & Beverage domain
        1, // page
        20 // limit
      );

      // Fetch stores from Grocery domain
      const storeData = await fetchHomeByDomain(
        latitude,
        longitude,
        selectedDetails.pincode,
        "ONDC:RET12", // Grocery domain
        1, // page
        20 // limit
      );

      if (restaurantData) {
        setRestaurantDomainData(restaurantData);
        setRestaurantsData(restaurantData.stores?.items || []);
      }

      if (storeData) {
        setStoreDomainData(storeData);
        setStoresData(storeData.stores?.items || []);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setIsLoadingHomeData(false);
    }
  };

  useEffect(() => {
    if (location) {
      getUserLocationDetails();
    }
  }, [location]);

  // Fetch home data when both location and delivery details are available
  useEffect(() => {
    if (location && selectedDetails?.pincode) {
      fetchHomeData();
    }
  }, [location, selectedDetails?.pincode]);

  const handleLocationPress = () => {
    router.push("../address/SavedAddresses");
  };

  // Render functions for category sections
  const renderFoodCategories = ({ item, index }) => {
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

  // Render function for nearby items (restaurants/stores)
  const renderNearbyItem = ({ item }: { item: DomainStore2 }) => (
    <TouchableOpacity
      style={styles.nearbyCard}
      onPress={() =>
        router.push(`/(tabs)/home/productListing/${item.provider_id}`)
      }
    >
      {/* Store Image */}
      <View style={styles.nearbyImageContainer}>
        <Image
          source={{ uri: item.symbol || "https://via.placeholder.com/120x80" }}
          style={styles.nearbyImage}
          resizeMode="cover"
        />
        {/* Offer Badge */}
        {item.offers && item.offers.length > 0 && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>
              UPTO {item.maxStoreItemOfferPercent || "50"}% OFF
            </Text>
          </View>
        )}
        {/* Delivery Time Badge */}
        {item.avg_tts_in_h && (
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={10} color="white" />
            <Text style={styles.timeBadgeText}>
              {Math.round(item.avg_tts_in_h * 24)} hrs
            </Text>
          </View>
        )}
      </View>

      {/* Store Info */}
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName} numberOfLines={1}>
          {item.name || "Unknown Store"}
        </Text>
        <Text style={styles.nearbyCategory} numberOfLines={1}>
          {item.store_categories?.join(", ") ||
            item.domain?.replace("ONDC:", "") ||
            "Store"}
        </Text>
        <Text style={styles.nearbyAddress} numberOfLines={1}>
          {item.address?.locality || item.address?.city || "Local Area"}
        </Text>

        {/* Rating and Distance */}
        <View style={styles.nearbyBottomRow}>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
          <Text style={styles.nearbyDistance}>
            {item.distance_in_km ? `${item.distance_in_km.toFixed(1)} km` : ""}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status === "open" ? "#00C851" : "#FF4444",
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
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

  const renderGroceryCategories = ({ item, index }) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Red Header Section */}
        <View style={styles.redSection}>
          {/* Location */}
          <TouchableOpacity
            style={styles.locationRow}
            onPress={handleLocationPress}
          >
            <FontAwesome6
              name="location-pin-lock"
              size={18}
              color="white"
              style={{ marginRight: 16 }}
            />
            <Text style={styles.deliveryTxt}>Delivering to</Text>
            {!selectedDetails?.city ? (
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginHorizontal: 6 }}
              />
            ) : (
              <>
                <Text style={styles.locationTxt} numberOfLines={1}>
                  {selectedDetails.city}
                  {selectedDetails.pincode
                    ? `, ${selectedDetails.pincode}`
                    : ""}
                </Text>
                <Entypo name="chevron-down" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push("../search")}
            activeOpacity={0.9}
          >
            <Ionicons
              name="search"
              size={20}
              color="#555"
              style={{ marginRight: 8 }}
            />
            <View
              style={{
                flexDirection: "row",
                flex: 1,
                overflow: "hidden",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#8E8A8A", fontSize: 16 }}>
                Search for{" "}
              </Text>
              <View style={{ overflow: "hidden", flex: 1 }}>
                <Animated.Text
                  style={{
                    color: "#8E8A8A",
                    fontSize: 16,
                    transform: [{ translateY }],
                    width: windowWidth,
                  }}
                >
                  {searchTexts[searchTextIndex]}
                </Animated.Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Categories */}
          <FlatList
            data={categoryData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.catList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.catCard}
                onPress={() => router.push(`./categories/${item.link}`)}
              >
                <Image source={item.image} style={styles.iconImg} />
                <Text style={styles.catLabel} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* White Content Section */}
        <View style={styles.whiteSection}>
          {/* Loading indicator for home data */}
          {isLoadingHomeData && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9130" />
              <Text style={styles.loadingText}>Loading nearby stores...</Text>
            </View>
          )}

          {/* Restaurants Nearby Section */}
          {restaurantsData?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Restaurants Near You</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => router.push("/(tabs)/home/categories/Food")}
                >
                  {/* <Text style={styles.seeAllText}>
                    See all
                    <Entypo
                      name="chevron-small-right"
                      size={14}
                      color="#FF9130"
                    />
                  </Text> */}
                </TouchableOpacity>
              </View>
              <FlatList
                data={restaurantsData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  `restaurant_${
                    item.provider_id || item.vendor_id || item.location_id
                  }_${index}`
                }
                contentContainerStyle={styles.nearbyList}
                renderItem={renderNearbyItem}
              />
            </View>
          )}

          {/* Stores Nearby Section */}
          {storesData?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Stores Near You</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => router.push("/(tabs)/home/categories/Grocery")}
                >
                  {/* <Text style={styles.seeAllText}>
                    See all
                    <Entypo
                      name="chevron-small-right"
                      size={14}
                      color="#FF9130"
                    />
                  </Text> */}
                </TouchableOpacity>
              </View>
              <FlatList
                data={storesData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  `store_${
                    item.provider_id || item.vendor_id || item.location_id
                  }_${index}`
                }
                contentContainerStyle={styles.nearbyList}
                renderItem={renderNearbyItem}
              />
            </View>
          )}

          {/* Show message when no data is available */}
          {!isLoadingHomeData &&
            restaurantsData?.length === 0 &&
            storesData?.length === 0 &&
            selectedDetails?.pincode && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  No stores or restaurants found in your area
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchHomeData}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
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
                  <TouchableOpacity key={index} style={styles.personalCareCard}>
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
                  <TouchableOpacity key={index} style={styles.homeDecorCard}>
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
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Made With ❤️</Text>
            <Text style={styles.footerSubtitle}>In Bengaluru</Text>
            <Text style={styles.footerDescription}>
              Your one-stop marketplace for everything you need
            </Text>
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
    marginTop: 8,
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
    marginTop: 13,
  },
  catCard: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    width: 46,
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
    backgroundColor: "#fffff",
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
  footerSection: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 20,
    borderRadius: 16,
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#303030",
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 20,
    fontWeight: "300",
    color: "#303030",
    marginBottom: 12,
  },
  footerDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  //
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  seeAllButton: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  seeAllText: {
    color: "#FF9130",
    fontSize: 14,
    fontWeight: "500",
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
    paddingHorizontal: -1,
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
});

export default HomeScreen;
