import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import OfferCard3 from "../../../../components/Categories/OfferCard3";
import Search from "../../../../components/common/Search";
import { groceriesCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import { HomeOfferType, Store2 } from "../../../../hook/fetch-domain-type";
import StoreCard3 from "../../../../components/Categories/StoreCard3";
import { Entypo } from "@expo/vector-icons";
import {styles} from "./cat"
const domain = "ONDC:RET10";

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
      store.slug || slugify(store.name, store.provider_id || `store-${index}`),
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

function Grocery() {
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
    return groceriesCategoryData.slice(0, 8).map((subCategory) => (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: subCategory.name, domainData: "ONDC:RET10" },
          })
        }
        style={styles.subCategory}
        key={subCategory.id}
      >
        <LinearGradient
          colors={["#E3F9BE", "rgba(231, 223, 201, 0)"]}
          style={styles.subCategoryImage}
        >
          <Image
            source={{ uri: subCategory.image }}
            resizeMode="contain"
            style={styles.subCategoryIcon}
          />
        </LinearGradient>
        <Text style={styles.subHeadingTextUp} numberOfLines={1}>
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

        {/* Explore by Categories Section */}
        <View style={styles.section}>
          <View style={styles.subHeading}>
            <View style={styles.line} />
            <Text style={styles.subHeadingText}>Explore by Categories</Text>
            <View style={styles.line} />
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/home/result/[search]",
                params: { search: "grocery", domainData: domain },
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
          <View style={styles.subCategories}>{renderSubCategories()}</View>
        </View>

        {/* Stores Section */}
        <View style={styles.section}>
          <View style={styles.subHeading}>
            <Text style={styles.subHeadingText}>
              <View style={styles.line} />
              Your Nearby Grocery Stores
              <View style={styles.line} />
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {storesData.map((storeData, index) => (
              <View
                key={`store-${storeData.id}-${index}`}
                style={{ width: 300, height: 350, marginRight: 12 }}
              >
                <StoreCard3
                  storeData={storeData}
                  categoryFiltered={[]}
                  userLocation={{
                    lat: selectedAddress?.lat || 0,
                    lng: selectedAddress?.lng || 0,
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Grocery;

