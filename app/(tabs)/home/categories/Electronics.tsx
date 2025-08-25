import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import OfferCard3 from "../../../../components/Categories/OfferCard3";
import Search from "../../../../components/common/Search";
import { electronicsCategoryData } from "../../../../constants/categories";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useRenderFunctions } from "../../../../components/Landing Page/render";
import { StoreSearchResult } from "@/app/search/search-stores-type";

const domain = "ONDC:RET14";

function Electronics() {
  const [offersData, setOffersData] = useState<any[]>([]);
  const [storesData, setStoresData] = useState<StoreSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const { renderNearbyItem } = useRenderFunctions();

  const handleSearchPress = () => {
    router.push("/search");
  };

  // Fetch data
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
        domain
      );
      setStoresData(Array.isArray(response?.stores) ? response.stores : []);
      setOffersData(Array.isArray(response?.offers) ? response.offers : []);
    } catch (err) {
      console.error("Error fetching domain data:", err);
      setError("Something went wrong while loading stores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAddress]);

  // Render subcategories in horizontal layout
  const renderSubCategories = () => (
    <FlatList
      data={electronicsCategoryData.slice(0, 8)}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.subCategoriesContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.subCategory}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/home/result/[search]",
              params: { search: item.name, domainData: domain },
            })
          }
        >
          <View style={styles.subCategoryImage}>
            <Image
              source={{ uri: item.image }}
              resizeMode="contain"
              style={styles.subCategoryIcon}
            />
          </View>
          <Text style={styles.subCategoryText}>{item.name}</Text>
        </TouchableOpacity>

      )}
    />
  );

  // Handle View More button press
  const handleViewMore = () => {
    if (storesData.length > 0) {
      const firstStore = storesData[0];
      router.push(`/(tabs)/home/result/productListing/${firstStore.slug}`);
    } else {
      router.push({
        pathname: "/(tabs)/home/result/[search]",
        params: { search: "electronics", domainData: domain },
      });
    }
  };

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
        {/* Header with Back + Search */}
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
        {offersData.length > 0 && (
          <View style={{ height: 200 }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {offersData.map((data, index) => (
                <OfferCard3 key={index} offerData={data} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* SubCategories */}
        <View>
          <View style={styles.sectionHeading}>
            <View style={styles.line} />
            <Text style={styles.sectionHeadingText}>Explore New Gadgets</Text>
            <View style={styles.line} />
          </View>
                 <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={handleViewMore}
          >
            <Text style={styles.viewMoreButtonText}>View More</Text>
                        <Entypo name="chevron-right" size={18} color="red" style={{alignItems:"center" , marginLeft:60,marginTop:-17}}/>

          </TouchableOpacity>
          {renderSubCategories()}

        </View>

        {/* Stores Section */}
        <View style={styles.storesSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading stores...</Text>
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
                  Your Nearby Electronics Stores
                </Text>
                <View style={styles.line} />
              </View>
              <FlatList
                data={storesData as any}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item.slug || index.toString()}
                contentContainerStyle={styles.storesContainer}
                renderItem={renderNearbyItem}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionHeadingTextNearby}>
                  Your Nearby Electronics Stores
                </Text>
              </View>

              <Ionicons name="storefront-outline" size={40} color="#999" />
              <Text style={styles.emptyText}>No stores found in your area</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default Electronics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
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
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  sectionHeadingTextNearby: {
    fontSize: 18,
    fontWeight: "600",
    color: "#df1010",
    marginTop: -20,
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
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subCategoryIcon: {
    width: 50,
    height: 50,
  },
  subCategoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  viewMoreButton: {
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-end",
marginRight:10
  },
  viewMoreButtonText: {
    color: "#f73e3e",
    fontSize: 14,
    fontWeight: "600",
  },
  storesSection: {
    marginBottom: 30,
  },
  storesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 10,
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
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
  },
});
