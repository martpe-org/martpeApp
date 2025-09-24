// HomeScreen.tsx
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useDeliveryStore from "../../../components/address/deliveryAddressStore";
import { useRenderFunctions } from "../../../components/Landing-Page/render";
import {
  categoryData,
  electronicsCategoryData,
  fashionCategoryData,
  foodCategoryData,
  groceriesCategoryData,
  homeAndDecorCategoryData,
  personalCareCategoryData,
} from "../../../constants/categories";
import { fetchHome } from "../../../hook/fetch-home-data";
import { styles } from "./HomeScreenStyle";

// Import the new components
import Search from "../../../components/common/Search";
import LocationBar from "@/components/common/LocationBar";
import CategorySection from "@/components/Landing-Page/CategorySection";
import FooterSection from "@/components/Landing-Page/FooterSection";

const windowWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const { selectedDetails, loadDeliveryDetails } = useDeliveryStore();

  // Import render functions including the new offers carousel
  const {
    renderCategoryItemCompact,
    renderOffersCarousel,
    renderRestaurantItem,
    renderStores,
    renderFoodCategories,
    renderGroceryCategories,
  } = useRenderFunctions();

  useEffect(() => {
    loadDeliveryDetails();
  });

  // Optimized fetch home data using react-query with better caching
  const {
    data: homeData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [
      "homeData",
      selectedDetails?.lat ?? 12.9716,
      selectedDetails?.lng ?? 77.5946,
      selectedDetails?.pincode ?? "560001",
    ],
    queryFn: async () => {
      const lat = selectedDetails?.lat ?? 12.9716; // Bangalore latitude
      const lng = selectedDetails?.lng ?? 77.5946; // Bangalore longitude
      const pin = selectedDetails?.pincode ?? "560001"; // Bangalore pincode
      return fetchHome(lat, lng, pin);
    },
    // Optimized caching configuration
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer (was cacheTime in v4)
    enabled: true,
    retry: 1,
    refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
    refetchOnMount: false, // Don't refetch on component mount if cache is fresh
    refetchOnReconnect: true, // Only refetch on network reconnect
    // Use initialData if you have any default data
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
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
  }, [homeData, fadeAnim]);

  const handleLocationPress = () => {
    router.push("/address/SavedAddresses");
  };

  const handleSearchPress = () => {
    router.push("/search/search");
  };

  // Pull-to-refresh handler - forces fresh data
  const onRefresh = () => {
    refetch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
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

          {/* NEW: Offers Carousel Section - Above restaurants, no heading */}
          {Array.isArray(homeData?.offers) && homeData.offers.length > 0 && (
            <View>{renderOffersCarousel(homeData.offers)}</View>
          )}

          {/* Restaurants */}
          {Array.isArray(homeData?.restaurants) &&
            homeData.restaurants.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Restaurants Near You</Text>
              </View>
              <FlatList
                data={homeData.restaurants}
                horizontal
                keyExtractor={(item, index) => `restaurant_${item.slug}_${index}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyList}
                renderItem={renderRestaurantItem}
              />
            </View>
          ) : (
            !isLoading && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text>No restaurants found in your area</Text>
              </Animated.View>
            )
          )}

          {/* Stores */}
          {Array.isArray(homeData?.stores) && homeData.stores.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Stores Near You</Text>
              </View>
              <FlatList
                data={homeData.stores}
                horizontal
                keyExtractor={(item, index) => `store_${item.slug}_${index}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyList}
                renderItem={renderStores}
              />
            </View>
          ) : (
            !isLoading && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text>No stores found in your area</Text>
              </Animated.View>
            )
          )}

          {/* Explore Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <View style={styles.headerLine} />
              <Text style={styles.sectionTitleCentered}>Explore Food Categories</Text>
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

          {/* Category Sections using the new component */}
          <CategorySection
            title="Shop for Fashion"
            data={fashionCategoryData}
            containerStyle="twoColumn"
          />

          <CategorySection
            title="Personal Care"
            data={personalCareCategoryData}
            containerStyle="personalCare"
          />

          <CategorySection
            title="Search for Electronics"
            data={electronicsCategoryData}
            containerStyle="twoColumn"
          />

          <CategorySection
            title="Home & Decor"
            data={homeAndDecorCategoryData}
            containerStyle="homeDecor"
          />

          {/* Footer Section */}
          <FooterSection/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}