import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import { getAddress } from "../../../utility/location";

const windowWidth = Dimensions.get("window").width;

const HomeScreen = () => {
  const router = useRouter();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const addDeliveryDetail = useDeliveryStore(
    (state) => state.addDeliveryDetail
  );

  // State variables
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [hasLocationBeenFetched, setHasLocationBeenFetched] = useState(false);
  const [hasHomeDataBeenFetched, setHasHomeDataBeenFetched] = useState(false);

  // Animation states
  const searchTexts = ["grocery", "biryani", "clothing", "electronics"];
  const [searchTextIndex, setSearchTextIndex] = useState(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Memoize expensive calculations with stable references
  const locationCoords = useMemo(() => {
    return location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : null;
  }, [location?.coords?.latitude, location?.coords?.longitude]);

  const selectedPincode = useMemo(() => {
    return selectedDetails?.pincode || null;
  }, [selectedDetails?.pincode]);

  const selectedCity = useMemo(() => {
    return selectedDetails?.city || null;
  }, [selectedDetails?.city]);

  const hasLocationAndPincode = useMemo(() => {
    return locationCoords && selectedPincode;
  }, [locationCoords, selectedPincode]);

  // Search text animation effect
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
  }, [searchTextIndex, scrollAnim]);

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -10],
  });

  // Location permission and fetching - stable callback
  const askForLocationPermissions = useCallback(async (): Promise<void> => {
    if (isLocationLoading || hasLocationBeenFetched) return;

    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setHasLocationBeenFetched(true);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setHasLocationBeenFetched(true);
    } catch (error) {
      console.error("Error during location permission and fetching:", error);
      setErrorMsg("Failed to get location");
      setHasLocationBeenFetched(true);
    } finally {
      setIsLocationLoading(false);
    }
  }, [isLocationLoading, hasLocationBeenFetched]);

  // Get city name from coordinates - stable callback
  const getCityName = useCallback(
    async (latitude: number, longitude: number): Promise<void> => {
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
    },
    [addDeliveryDetail]
  );

  // Get user location details - stable callback with proper dependencies
  const getUserLocationDetails = useCallback(async (): Promise<void> => {
    if (!locationCoords) return;
    try {
      await getCityName(locationCoords.latitude, locationCoords.longitude);
    } catch (error) {
      console.error("Error in fetching user location details:", error);
    }
  }, [locationCoords, getCityName]);

  // Fetch home data - stable callback with proper dependencies
  const fetchHomeData = useCallback(async (): Promise<void> => {
    if (
      !locationCoords ||
      !selectedPincode ||
      isLoadingHomeData ||
      hasHomeDataBeenFetched
    ) {
      return;
    }

    console.log("Fetching home data...");
    setIsLoadingHomeData(true);

    try {
      // Fetch both restaurant and store data in parallel
      const [restaurantData, storeData] = await Promise.all([
        fetchHomeByDomain(
          locationCoords.latitude,
          locationCoords.longitude,
          selectedPincode,
          "ONDC:RET10",
          1,
          20
        ),
        fetchHomeByDomain(
          locationCoords.latitude,
          locationCoords.longitude,
          selectedPincode,
          "ONDC:RET12",
          1,
          20
        ),
      ]);

      if (restaurantData) {
        setRestaurantDomainData(restaurantData);
        setRestaurantsData(restaurantData.stores?.items || []);
      }

      if (storeData) {
        setStoreDomainData(storeData);
        setStoresData(storeData.stores?.items || []);
      }

      setErrorMsg(null);
      setHasHomeDataBeenFetched(true);
    } catch (error) {
      console.error("Error fetching home data:", error);
      setErrorMsg("Failed to load nearby stores");
    } finally {
      setIsLoadingHomeData(false);
    }
  }, [
    locationCoords,
    selectedPincode,
    isLoadingHomeData,
    hasHomeDataBeenFetched,
  ]);

  // Reset home data fetch flag when location or pincode changes
  useEffect(() => {
    setHasHomeDataBeenFetched(false);
  }, [locationCoords, selectedPincode]);

  // Effects with stable dependencies
  useEffect(() => {
    askForLocationPermissions();
  }, [askForLocationPermissions]);

  useEffect(() => {
    if (locationCoords && !selectedCity) {
      getUserLocationDetails();
    }
  }, [locationCoords, selectedCity, getUserLocationDetails]);

  useEffect(() => {
    if (
      hasLocationAndPincode &&
      !isLoadingHomeData &&
      !hasHomeDataBeenFetched
    ) {
      fetchHomeData();
    }
  }, [
    hasLocationAndPincode,
    isLoadingHomeData,
    hasHomeDataBeenFetched,
    fetchHomeData,
  ]);

  // Event handlers - stable callbacks
  const handleLocationPress = useCallback(() => {
    router.push("../address/SavedAddresses");
  }, [router]);

  const handleCategoryPress = useCallback(
    (item: any) => {
      setActiveCategory(item.id);
      router.push(`./categories/${item.link}`);
    },
    [router]
  );

  const handleRetry = useCallback(() => {
    setHasHomeDataBeenFetched(false);
    setErrorMsg(null);
    if (hasLocationAndPincode) {
      fetchHomeData();
    } else {
      setHasLocationBeenFetched(false);
      askForLocationPermissions();
    }
  }, [hasLocationAndPincode, fetchHomeData, askForLocationPermissions]);

  // Render functions - stable callbacks
  const renderCategoryItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={[
          styles.catCard,
          activeCategory === item.id && styles.catCardActive,
        ]}
        onPress={() => handleCategoryPress(item)}
      >
        <Image source={item.image} style={styles.iconImg} />
        <Text style={styles.catLabel} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [activeCategory, handleCategoryPress]
  );

  const renderNearbyItem = useCallback(
    ({ item }: { item: DomainStore2 }) => (
      <TouchableOpacity
        style={styles.nearbyCard}
        onPress={() =>
          router.push(`/(tabs)/home/productListing/${item.provider_id}`)
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
                UPTO {item.maxStoreItemOfferPercent || "50"}% OFF
              </Text>
            </View>
          )}
          {item.avg_tts_in_h && (
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={10} color="white" />
              <Text style={styles.timeBadgeText}>
                {Math.round(item.avg_tts_in_h * 24)} hrs
              </Text>
            </View>
          )}
        </View>

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

          <View style={styles.nearbyBottomRow}>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
            <Text style={styles.nearbyDistance}>
              {item.distance_in_km
                ? `${item.distance_in_km.toFixed(1)} km`
                : ""}
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
    ),
    [router]
  );

  const renderFoodCategories = useCallback(
    ({ item, index }: { item: any; index: number }) => {
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
    },
    [router]
  );

  const renderGroceryCategories = useCallback(
    ({ item, index }: { item: any; index: number }) => {
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
              <Image
                source={{ uri: nextItem.image }}
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>{nextItem.name}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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
            {isLocationLoading || (!selectedCity && locationCoords) ? (
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginHorizontal: 6 }}
              />
            ) : (
              <>
                <Text style={styles.locationTxt} numberOfLines={1}>
                  {selectedCity || "Select Location"}
                  {selectedPincode ? `, ${selectedPincode}` : ""}
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
            renderItem={renderCategoryItem}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>

        {/* White Content Section */}
        <View style={styles.whiteSection}>
          {/* Error Message */}
          {errorMsg && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading indicator */}
          {isLoadingHomeData && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9130" />
              <Text style={styles.loadingText}>Loading nearby stores...</Text>
            </View>
          )}

          {/* Restaurants Section */}
          {!isLoadingHomeData && restaurantsData.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Restaurants Near You</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => router.push("../(tabs)/home/categories/Food")}
                ></TouchableOpacity>
              </View>
              <FlatList
                data={restaurantsData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  `restaurant_${item.provider_id}_${index}`
                }
                contentContainerStyle={styles.nearbyList}
                renderItem={renderNearbyItem}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                initialNumToRender={3}
                windowSize={5}
              />
            </View>
          )}

          {/* Stores Section */}
          {!isLoadingHomeData && storesData.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Stores Near You</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() =>
                    router.push("../(tabs)/home/categories/Grocery")
                  }
                ></TouchableOpacity>
              </View>
              <FlatList
                data={storesData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  `store_${item.provider_id}_${index}`
                }
                contentContainerStyle={styles.nearbyList}
                renderItem={renderNearbyItem}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                initialNumToRender={3}
                windowSize={5}
              />
            </View>
          )}

          {/* No Data Message */}
          {!isLoadingHomeData &&
            restaurantsData.length === 0 &&
            storesData.length === 0 &&
            hasLocationAndPincode && (
              <View style={styles.noDataContainer}>
                <Ionicons name="storefront-outline" size={48} color="#ccc" />
                <Text style={styles.noDataText}>
                  No stores or restaurants found in your area
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
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
    borderRadius: 8, // Add border radius for better look
    backgroundColor: "transparent", // Default background
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
});

export default HomeScreen;
