import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import * as Location from "expo-location";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { fetchHome } from "../../../hook/fetch-home-data";
import useDeliveryStore from "../../../state/deliveryAddressStore";
import { Ionicons } from "@expo/vector-icons";
import { useRenderFunctions } from "../../../components/Landing Page/render";
import {
  categoryData,
  electronicsCategoryData,
  fashionCategoryData,
  foodCategoryData,
  groceriesCategoryData,
  homeAndDecorCategoryData,
  personalCareCategoryData,
} from "../../../constants/categories";
import { styles } from "./HomeScreenStyle";
// Import the new components
import LocationBar from "../../../components/common/LocationBar";
import Search from "../../../components/common/Search";
const windowWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const { selectedDetails, loadDeliveryDetails } = useDeliveryStore();

  // Import render functions
  const {
    renderCategoryItemCompact,
    renderRestaurantItem,
    renderNearbyItem,
    renderFoodCategories,
    renderGroceryCategories,
  } = useRenderFunctions();

  useEffect(() => {
    loadDeliveryDetails();
  }, []);

  // TanStack Query for fetching home data
  const {
    data: homeData,
    isLoading,
    error,
    refetch,
    isRefetching,
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

      if (!lat || !lng || !pin) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;

        const [address] = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        pin = address.postalCode || "";
      }

      return fetchHome(lat, lng, pin);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    enabled: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Animation value for "No Data" messages
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (homeData) {
      if (!homeData.restaurants?.length || !homeData.stores?.length) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        fadeAnim.setValue(0);
      }
    }
  }, [homeData]);

  const handleLocationPress = () => {
    router.push("/address/SavedAddresses");
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

  // Pull-to-refresh handler
  const onRefresh = () => {
    refetch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || isLoading}
            onRefresh={onRefresh}
            colors={["#f2663c"]} // Android spinner color
            tintColor="#f2663c" // iOS spinner color
          />
        }
      >
        {/* Red header */}
        <View style={styles.redSection}>
          <LocationBar
            selectedDetails={selectedDetails}
            onPress={handleLocationPress}
          />

          <Search onPress={handleSearchPress} />
          <FlatList
            data={categoryData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.catList}
            renderItem={({ item, index }) =>
              renderCategoryItemCompact({ item, index })
            }
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
              <Text style={styles.errorText}>
                Something went wrong loading data.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Restaurants */}
          {Array.isArray(homeData?.restaurants) &&
          homeData.restaurants.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Restaurants Near You</Text>
              </View>
              <FlatList
                data={homeData.restaurants}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  `restaurant_${item.slug}_${index}`
                }
                contentContainerStyle={styles.nearbyList}
                renderItem={renderRestaurantItem}
              />
            </View>
          ) : (
            !isLoading && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  alignItems: "center",
                  marginVertical: 20,
                }}
              >
                <Ionicons name="restaurant-outline" size={40} color="#999" />
                <Text style={{ fontSize: 16, color: "#555", marginTop: 8 }}>
                  No restaurants found in your area
                </Text>
              </Animated.View>
            )
          )}

          {/* Stores */}
          {Array.isArray(homeData?.stores) && homeData.stores.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Stores Near You</Text>
              </View>
              <FlatList
                data={homeData.stores}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `store_${item.slug}_${index}`}
                contentContainerStyle={styles.nearbyList}
                renderItem={renderNearbyItem}
              />
            </View>
          ) : (
            !isLoading && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  alignItems: "center",
                  marginVertical: 20,
                }}
              >
                <Ionicons name="storefront-outline" size={40} color="#999" />
                <Text style={{ fontSize: 16, color: "#555", marginTop: 8 }}>
                  No stores found in your area
                </Text>
              </Animated.View>
            )
          )}
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
                  onPress={() => {
                    router.push({
                      pathname: "/(tabs)/home/result/[search]",
                      params: {
                        search: item.name,
                      },
                    });
                  }}
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
                  onPress={() => {
                    router.push({
                      pathname: "/(tabs)/home/result/[search]",
                      params: {
                        search: item.name,
                      },
                    });
                  }}
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
                source={require("../../../assets/tabs/footer.webp")}
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
}