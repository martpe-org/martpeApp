import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import OfferCard3 from "../../../../components/Categories/OfferCard3";
import StoreCard4 from "../../../../components/Categories/StoreCard4";
import Search from "../../../../components/common/Search";
import { foodCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import { useHideTabBarStore } from "../../../../state/hideTabBar";
import {
  filters,
  offerData,
  deliveryData,
} from "../../../../constants/filters";
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { useRenderFunctions } from "@/components/Landing Page/render";
import { StoreSearchResult } from "@/app/search/search-stores-type";
import { LinearGradient } from "expo-linear-gradient";

const domain = "ONDC:RET11";
const screenWidth = Dimensions.get("window").width;

function Food() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterSelected, setFilterSelected] = useState({
    category: [] as string[],
    offers: 0,
    delivery: 100,
  });
  const [storesData, setStoresData] = useState<StoreSearchResult[]>([]);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const { renderNearbyItem, renderRestaurantItem } = useRenderFunctions();



  // Fetch domain data
  const fetchData = async () => {
    if (!selectedAddress?.lat || !selectedAddress?.lng) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchHomeByDomain(
        selectedAddress.lat,
        selectedAddress.lng,
        selectedAddress.pincode || "110001",
        domain,
        1,
        20
      );
      setStoresData(
        Array.isArray(response?.stores?.items) ? response.stores.items : []
      );
      setOffersData(Array.isArray(response?.offers) ? response.offers : []);
    } catch (err) {
      console.error("Error fetching domain data:", err);
      setError("Something went wrong while loading restaurants.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAddress]);

  const handleSearchPress = () => {
    router.push("/search");
  };

  // Collect unique categories
  const allCatalogs = Array.isArray(storesData)
    ? storesData.flatMap((store) => store.catalogs || [])
    : [];
  const uniqueCategoryIds = Array.from(
    new Set(allCatalogs.map((c) => c?.category_id))
  ).map((category, index) => ({
    id: index + 1,
    label: category,
    value: category,
  }));

  // Filter stores
  const filteredStores = storesData.filter((store) => {
    const meetsCategory =
      filterSelected.category.length === 0 ||
      store.catalogs?.some((c: any) =>
        filterSelected.category.includes(c.category_id)
      );
    const meetsOffer =
      filterSelected.offers === 0 ||
      store.calculated_max_offer?.percent >= filterSelected.offers;
    const meetsDelivery =
      filterSelected.delivery === 100 ||
      store?.time_to_ship_in_hours?.avg <= filterSelected.delivery;
    return meetsCategory && meetsOffer && meetsDelivery;
  });

  // Render subcategories in horizontal layout
  const renderSubCategories = () => (
    <FlatList
      data={foodCategoryData.slice(0, 8)}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.subCategoriesContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.subCategory}
                 onPress={() => router.push(`/(tabs)/home/result/${item.name}`)}

        >
       <LinearGradient
            colors={["#F9E7B0", "rgba(231, 223, 201, 0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subCategoryImage}
          >
            <Image
              source={{ uri: item.image }}
              resizeMode="contain"
              style={styles.subCategoryIcon}
            />
          </LinearGradient>
<Text style={styles.subCategoryName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );

  const handleViewMore = () => {
    if (storesData.length > 0) {
      const firstStore = storesData[0];
      router.push(`/(tabs)/home/result/productListing/${firstStore.slug}`);
    } else {
      router.push({
        pathname: "/(tabs)/home/result/[search]",
        params: { search: "foodAndBeverages", domainData: domain },
      });
    }
  }

  if (isLoading) return <Loader />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchData}
            colors={["#f2663c"]}
            tintColor="#f2663c"
          />
        }
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Entypo name="chevron-left" size={22} color="#111" />
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <Search onPress={handleSearchPress} />
          </View>
        </View>

        {/* Offers */}
        <View style={styles.offersContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersScrollContainer}
          >
            {offersData.map((data, index) => (
              <OfferCard3 key={index} offerData={data} />
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View>
          <View style={styles.sectionHeading}>
            <View style={styles.line} />
            <Text style={styles.sectionHeadingText}>What's on your mind?</Text>
            <View style={styles.line} />
          </View>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={handleViewMore}
          >
            <Text style={styles.viewMoreButtonText}>View More</Text>
            <Entypo 
              name="chevron-right" 
              size={18} 
              color="red" 
              style={{
                alignItems: "center", 
                marginLeft: 60, 
                marginTop: -17
              }}
            />
          </TouchableOpacity>
          {renderSubCategories()}
        </View>

        {/* Stores Section */}
        <View style={styles.storesSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading restaurants...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : storesData.length > 0 ? (
            <>
              <View style={styles.sectionHeading}>
                <View style={styles.line} />
                <Text style={styles.sectionHeadingText}>
                  Your Nearby Restaurants
                </Text>
                <View style={styles.line} />
              </View>
              <FlatList
                data={filteredStores as any}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                contentContainerStyle={styles.storesContainer}
                renderItem={renderNearbyItem}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionHeadingTextNearby}>
                  Your Nearby Restaurants
                </Text>
              </View>
              <Ionicons name="restaurant-outline" size={40} color="#999" />
              <Text style={styles.emptyText}>No restaurants available in your area</Text>
            </View>
          )}
        </View>

        {/* Traditional Store Cards for filtered view */}
        {storesData.length > 0 && (filterSelected.category.length > 0 ||
          filterSelected.offers > 0 ||
          filterSelected.delivery < 100) && (
          <View style={styles.filteredStoresSection}>
            <View style={styles.subHeading}>
              <Text style={styles.subHeadingText}>
                Explore {filteredStores.length} Restaurants nearby
              </Text>
            </View>
            {filteredStores.map((store, index) => (
              <StoreCard4
                key={store?.id || index}
                storeData={store}
                categoryFiltered={filterSelected.category}
                index={index}
              />
            ))}
          </View>
        )}
      </ScrollView>

    </View>
  );
}

export default Food;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    marginTop: -9,
  },
  searchWrapper: {
    flex: 1,
    marginTop: -20,
  },
  offersContainer: {
    height: 200,
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  offersScrollContainer: {
    paddingHorizontal: 10,
  },
    storesSection: {
    marginBottom: 30,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#0a0909",
  },
  sectionHeadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 16,
  },
  subCategoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subCategory: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  subCategoryImage: {
    width: 80,
    height: 60,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "#f8f8f8",
  },
  subCategoryIcon: {
    width: 60,
    height: 45,
  },
  subCategoryName: {
    fontSize: 12,
    fontWeight: "400",
    color: "#333",
    textAlign: "center",
  },
  viewMoreButton: {
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  viewMoreButtonText: {
    color: "#f73e3e",
    fontSize: 14,
    fontWeight: "600",
  },
  viewMoreIcon: {
    marginLeft: 2,
  },
  filtersContainer: {
    margin: 10,
  },
  filterChip: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "white",
  },
  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginHorizontal: 20,
  },
  subHeadingText: { fontSize: 14, fontWeight: "600", marginVertical: 10 },
  sectionHeadingTextNearby: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: -20,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
  },
  storesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filteredStoresSection: {
    marginTop: 20,
  },
  errorContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FB3E44",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
    textAlign: "center",
  },
});