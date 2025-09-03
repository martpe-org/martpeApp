import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import OfferCard3 from "../../../../components/Categories/OfferCard3";
import Search from "../../../../components/common/Search";
import { electronicsCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import { HomeOfferType, Store2 } from "../../../../hook/fetch-domain-type";
import StoreCard3 from "../../../../components/Categories/StoreCard3";
import { Entypo } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const domain = "ONDC:RET14";

// Transform API response to match component expectations
const transformOfferData = (offers: HomeOfferType[]) => {
  return offers.map((offer) => ({
    id: offer.store_id,
    calculated_max_offer: {
      percent: offer.store.maxStoreItemOfferPercent || 0,
    },
    descriptor: {
      name: offer.store.name,
      images: offer.images || [],
      symbol: offer.store.symbol,
    },
  }));
};
const slugify = (name: string, fallback: string) =>
  name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : fallback;

const transformStoreData = (stores: Store2[]) => {
  return stores.map((store, index) => ({
    id: store.provider_id || `store-${index}`,
    slug:
      store.slug || slugify(store.name, store.provider_id || `store-${index}`), // ✅ always generate a slug
    descriptor: {
      name: store.name,
      symbol: store.symbol,
      images: store.images,
    },
    address: {
      city: store.address?.city || "",
      state: store.address?.state || "",
    },
    geoLocation: {
      lat: store.gps.lat,
      lng: store.gps.lon,
    },
    catalogs: store.catalogs || [],
    calculated_max_offer: {
      percent: store.maxStoreItemOfferPercent || 0,
    },
  }));
};

// Custom hook for fetching domain data
const useDomainData = (lat?: number, lng?: number, pincode?: string) => {
  return useQuery({
    queryKey: ["domainData", domain, lat, lng, pincode],
    queryFn: async () => {
      if (!lat || !lng || !pincode) {
        throw new Error("Location data is required");
      }
      const response = await fetchHomeByDomain(
        lat,
        lng,
        pincode,
        domain,
        1,
        20
      );
      if (!response) throw new Error("Failed to fetch domain data");

      return {
        stores: transformStoreData(response.stores.items),
        offers: transformOfferData(response.offers || []),
      };
    },
    enabled: !!lat && !!lng && !!pincode,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  });
};

function Electronics() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || selectedAddress || "110001";

  const { data: domainData, isLoading } = useDomainData(
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const storesData = domainData?.stores || [];
  const offersData = domainData?.offers || [];

  const renderSubCategories = () => {
    return electronicsCategoryData.slice(0, 8).map((subCategory) => (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: subCategory.name, domainData: "ONDC:RET14" },
          })
        }
        style={styles.subCategory}
        key={subCategory.id}
      >
        <View style={styles.subCategoryImage}>
          <Image
            source={{ uri: subCategory.image }}
            resizeMode="contain"
            style={{ width: 80, height: 80 }}
          />
        </View>
        <Text style={styles.subHeadingText} numberOfLines={2}>
          {subCategory.name}
        </Text>
      </TouchableOpacity>
    ));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader />
      </SafeAreaView>
    );
  }


  if (!storesData.length && !offersData.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }
  const handleSearchPress = () => {
    router.push("/search");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Header */}
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

        {/* Offers Section */}
        {offersData.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {offersData.map((data, index) => (
              <OfferCard3 offerData={data} key={`offer-${data.id}-${index}`} />
            ))}
          </ScrollView>
        )}

        {/* Explore Gadgets Section */}
        <View style={styles.section}>
          <View style={styles.subHeading}>
            <View style={styles.line} />
            <Text style={styles.subHeadingText}>Explore New Gadgets</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.subCategories}>{renderSubCategories()}</View>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/home/result/[search]",
                params: { search: "electronics", domainData: domain },
              })
            }
            style={styles.viewMoreButton}
          >
            <Text style={styles.viewMoreButtonText}>View More</Text>
            <Image
              source={require("../../../../assets/right_arrow.png")}
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>

        {/* Stores Section */}
        <View style={styles.section}>
          <View style={styles.subHeading}>
            <View style={styles.line} />
            <Text style={styles.subHeadingText}>
              Electronics Stores Near You
            </Text>
            <View style={styles.line} />
          </View>

          {storesData.map((storeData, index) => (
            <StoreCard3
              key={`store-${storeData.id}-${index}`}
              storeData={storeData}
              categoryFiltered={[]}
                    userLocation={{
        lat: selectedAddress?.lat || 0,
        lng: selectedAddress?.lng || 0,
      }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Electronics;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  section: { marginVertical: 10 },
  subCategories: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginVertical: 15,
    paddingHorizontal: 10,
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
  subCategory: {
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    width: (screenWidth - 80) / 4,
  },
  subCategoryImage: {
    backgroundColor: "#f8f9fa",
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    padding: 12,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    marginHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  subHeadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  viewMoreButtonText: { color: "#F13A3A", fontSize: 12, fontWeight: "500" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
