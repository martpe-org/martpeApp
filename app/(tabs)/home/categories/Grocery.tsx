import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
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
import { Store2 } from "../../../../hook/fetch-domain-type";
import StoreCard3 from "../../../../components/Categories/StoreCard3";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { styles } from "./cat";

const { width } = Dimensions.get("window");
const domain = "ONDC:RET10";

// ✅ Slugify fallback
const slugify = (name: string, fallback: string) =>
  name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : fallback;

// ✅ Store transform
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
      lat: store.gps?.lat,
      lng: store.gps?.lon,
    },
    calculated_max_offer: {
      percent: store.maxStoreItemOfferPercent || 0,
    },
  }));
};

// ✅ Domain fetch hook
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
        stores: transformStoreData(response.stores.items || []),
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

  // ✅ Carousel State
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // ✅ Auto-scroll every 3s
  useEffect(() => {
    if (!storesData.length) return;
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % storesData.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [activeIndex, storesData.length]);

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

  const renderSubCategories = () => {
    return groceriesCategoryData.slice(0, 8).map((subCategory) => (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: subCategory.name, domainData: domain },
          })
        }
        style={styles.subCategory}
        key={subCategory.id}
      >
        <LinearGradient
          colors={["#ffffff", "#f0fdf4", "#dcfce7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
        <Ionicons name="arrow-back-outline" size={20} color="black" />
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <Search onPress={handleSearchPress} />
          </View>
        </View>

        {/* ✅ Offers Section with auto-scroll + dots */}
        {storesData.length > 0 && (
          <View>
            <FlatList
              ref={flatListRef}
              data={storesData}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `offer-${item.id}-${index}`}
              renderItem={({ item }) => (
                <View style={{ width: width * 0.8, alignItems: "center" }}>
                  <OfferCard3 storeData={item} />
                </View>
              )}
              onMomentumScrollEnd={(ev) => {
                const index = Math.round(
                  ev.nativeEvent.contentOffset.x / (width * 0.8)
                );
                setActiveIndex(index);
              }}
            />

            {/* Pagination Dots */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              {storesData.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: activeIndex === index ? "#E11D48" : "#ccc",
                  }}
                />
              ))}
            </View>
          </View>
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

          <FlatList
            data={storesData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `store-${item.id}-${index}`}
            renderItem={({ item }) => (
              <View style={{ width: 300, height: 320, marginRight: 6 , marginLeft:-10, marginBottom:-20}}>
                <StoreCard3
                  storeData={item}
                  categoryFiltered={[]}
                  userLocation={{
                    lat: selectedAddress?.lat || 0,
                    lng: selectedAddress?.lng || 0,
                  }}
                />
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Grocery;
