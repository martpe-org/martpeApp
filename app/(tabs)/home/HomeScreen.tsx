import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
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

import Search from "../../../components/common/Search";
import LocationBar from "@/components/common/LocationBar";
import CategorySection from "@/components/Landing-Page/CategorySection";
import FooterSection from "@/components/Landing-Page/FooterSection";

const windowWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const { selectedDetails, loadDeliveryDetails } = useDeliveryStore();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);

  const {
    renderCategoryItemCompact,
    renderOffersCarousel,
    renderRestaurantItem,
    renderStores,
    renderFoodCategories,
    renderGroceryCategories,
  } = useRenderFunctions();

  // Load saved delivery details once
  useEffect(() => {
    const loadData = async () => {
      await loadDeliveryDetails();
      setIsAddressLoaded(true);
    };
    loadData();
  }, []);

  // Show modal only if address is missing and loading is complete
  useEffect(() => {
    if (isAddressLoaded) {
      const hasLocation =
        selectedDetails &&
        (selectedDetails?.pincode ||
          selectedDetails?.lat ||
          selectedDetails?.lng);

      if (!hasLocation) {
        setTimeout(() => setShowLocationModal(true), 500);
      }
    }
  }, [isAddressLoaded, selectedDetails]);

  // Fetch home data only when address exists
  const {
    data: homeData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [
      "homeData",
      selectedDetails?.lat ?? 0,
      selectedDetails?.lng ?? 0,
      selectedDetails?.pincode ?? "",
    ],
    queryFn: async () => {
      const lat = selectedDetails?.lat ?? 12.9716;
      const lng = selectedDetails?.lng ?? 77.5946;
      const pin = selectedDetails?.pincode ?? "560001";
      return fetchHome(lat, lng, pin);
    },
    enabled: !!selectedDetails?.pincode,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (homeData) {
      if (!homeData.restaurants?.length || !homeData.stores?.length) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else fadeAnim.setValue(0);
    }
  }, [homeData, fadeAnim]);

  const handleLocationPress = () => {
    router.push("/address/SavedAddresses");
  };

  const handleSearchPress = () => {
    router.push("/search/search");
  };

  const onRefresh = () => refetch();

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Location Modal (only for new users or no address) */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 15,
              padding: 25,
              width: "90%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
              Add Your Location
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#555",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Please add your address to see nearby restaurants and stores.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#FB3E44",
                paddingVertical: 12,
                paddingHorizontal: 25,
                borderRadius: 50,
              }}
              onPress={() => {
                setShowLocationModal(false);
                router.push("/address/SavedAddresses");
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Add Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scrollable Home Content */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <View style={styles.redSection}>
          <LocationBar
            selectedDetails={selectedDetails}
            onPress={handleLocationPress}
          />
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
          <Search onPress={handleSearchPress} />
        </View>

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

          {Array.isArray(homeData?.offers) && homeData.offers.length > 0 && (
            <View>{renderOffersCarousel(homeData.offers)}</View>
          )}

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

          {/* Grocery + Food + Other Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <Text style={styles.sectionTitleCentered}>Shop for Groceries</Text>
            </View>
            <FlatList
              data={groceriesCategoryData}
              renderItem={renderGroceryCategories}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderWithLine}>
              <Text style={styles.sectionTitleCentered}>Shop for Food</Text>
            </View>
            <FlatList
              data={foodCategoryData}
              renderItem={renderFoodCategories}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          <CategorySection
            title="Shop for Fashion"
            data={fashionCategoryData}
            containerStyle="twoColumn"
          />
          <CategorySection
            title="Shop for Personal Care"
            data={personalCareCategoryData}
            containerStyle="personalCare"
          />
          <CategorySection
            title="Shop for Electronics"
            data={electronicsCategoryData}
            containerStyle="twoColumn"
          />
          <CategorySection
            title="Shop for Home & Decor"
            data={homeAndDecorCategoryData}
            containerStyle="homeDecor"
          />

          <FooterSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
