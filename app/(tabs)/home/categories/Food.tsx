import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import OfferCard3 from "../../../../components/Categories/OfferCard3";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import { FetchDomainType, HomeOfferType, Store2 } from "../../../../hook/fetch-domain-type";
import Search from "../../../../components/common/Search";
import { foodCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";

import StoreCard4 from "../../../../components/Categories/StoreCard4";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import Carousel from "react-native-reanimated-carousel";
import useUserDetails from "../../../../hook/useUserDetails";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import { Entypo } from "@expo/vector-icons";
import FilterCard from "../../../../components/search/filterCard";
import { useHideTabBarStore } from "../../../../state/hideTabBar";
import { filters, offerData, deliveryData } from "../../../../constants/filters";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";

// Type definitions
interface FilterSelected {
  category: string[];
  offers: number;
  delivery: number;
}

interface FoodDetails {
  images: string;
  long_desc: string;
  name: string;
  short_desc: string;
  symbol: string;
  price: string;
  storeId: string;
  maxQuantity: number;
  itemId: string;
  visible: boolean;
  maxPrice: number;
  discount: number;
}

interface CategoryOption {
  id: number;
  label: string;
  value: string;
}

interface Catalog {
  category_id: string;
  [key: string]: any; // Allow additional catalog properties
}

interface CalculatedMaxOffer {
  percent: number;
  [key: string]: any; // Allow additional offer properties
}

interface TimeToShip {
  avg: number;
  [key: string]: any; // Allow additional time properties
}

// Extend Store2 interface to match what components expect
interface ExtendedStore extends Store2 {
  id: string;
  catalogs?: Catalog[];
  calculated_max_offer?: CalculatedMaxOffer;
  time_to_ship_in_hours?: TimeToShip;
}

const domain = "ONDC:RET11";
const screenWidth = Dimensions.get("window").width;

function Food() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const setHideTabBar = useHideTabBarStore((state) => state.setHideTabBar);
  const [filterSelected, setFilterSelected] = useState<FilterSelected>({
    category: [],
    offers: 0,
    delivery: 100,
  });
  const [foodDetails, setFoodDetails] = useState<FoodDetails>({
    images: "",
    long_desc: "",
    name: "",
    short_desc: "",
    symbol: "",
    price: "",
    storeId: "",
    maxQuantity: 0,
    itemId: "",
    visible: true,
    maxPrice: 0,
    discount: 0,
  });
  const containerHeight = 200;
  const [storesData, setStoresData] = useState<ExtendedStore[]>([]);
  const [offersData, setOffersData] = useState<HomeOfferType[]>([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bottonSheetIndex, setBottonSheetIndex] = useState(-1);

  const { userDetails, getUserDetails } = useUserDetails();
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);

  useEffect(() => {
    getUserDetails();
  }, [getUserDetails]);

  const snapPoints = useMemo(() => ["30%", "40%", "50%", "60%", "75%"], []);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setIsFilterVisible(false);
    setFoodDetails(prev => ({ ...prev, visible: true }));
  };
  
  const handleOpenPress = () => {
    bottomSheetRef.current?.expand();
  };
  
  const handleCollapsePress = () => {
    bottomSheetRef.current?.collapse();
  };
  
  const snapeToIndex = (index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
  };

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  // Transform Store2 to ExtendedStore format
  const transformStoreData = (store: Store2): ExtendedStore => {
    return {
      ...store,
      id: store.provider_id || store.slug || `store-${Date.now()}`,
      catalogs: store.menu || [], // Assuming menu contains catalog data
      calculated_max_offer: {
        percent: store.maxStoreItemOfferPercent || 0,
      },
      time_to_ship_in_hours: {
        avg: store.avg_tts_in_h || 0,
      },
    };
  };

  // Fetch domain data
  useEffect(() => {
    async function domainDataFetch() {
      if (!selectedAddress?.lat || !selectedAddress?.lng) {
        console.log("No location data available");
        setIsLoading(false);
        return;
      }

      try {
        // Extract pincode from area_code or use a default
        const pincode = selectedAddress?.pincode || "110044";
        
        const response = await fetchHomeByDomain(
          selectedAddress.lat,
          selectedAddress.lng,
          pincode,
          domain,
          1, // page
          20 // limit
        );
        
        if (response) {
          const { stores, offers } = response;
          
          if (stores?.items) {
            const transformedStores = stores.items
              .filter((store: Store2) => store && Object.keys(store).length > 0)
              .map(transformStoreData);
            setStoresData(transformedStores);
          }
          
          if (offers) {
            const filteredOffers = offers.filter(
              (offer: HomeOfferType) => offer && Object.keys(offer).length > 0
            );
            setOffersData(filteredOffers);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching domain data:", error);
        setIsLoading(false);
      }
    }
    
    domainDataFetch();
  }, [selectedAddress]);

  // Flatten the catalogs from each store into a single array
  const allCatalogs = Array.isArray(storesData) && storesData.length > 0
    ? storesData.flatMap((store) => store?.catalogs || [])
    : [];

  // Extract unique category_id values
  const uniqueCategoryIds: CategoryOption[] = Array.from(
    new Set(allCatalogs.map((catalog) => catalog?.category_id).filter(Boolean))
  ).map((category_id, index) => ({
    id: index + 1,
    label: category_id as string,
    value: category_id as string,
  }));

  const renderSubCategories = () => {
    return foodCategoryData.slice(0, 8)?.map((subCategory: any) => (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: subCategory?.name, domainData: domain },
          });
        }}
        style={styles.subCategory}
        key={subCategory?.id}
      >
        <View style={styles.subCategoryImage}>
          <Image
            source={{
              uri: subCategory?.image,
            }}
            resizeMode="contain"
            style={{ width: 80, height: 60 }}
          />
        </View>
        <Text style={styles.subCategoryName}>{subCategory?.name}</Text>
      </TouchableOpacity>
    ));
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!storesData.length && !offersData.length) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Search
            placeholder="Search for food.."
            showBackArrow={true}
            showLocation={false}
            domain={domain}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: "black", fontSize: 16 }}>No restaurants available in your area</Text>
        </View>
      </View>
    );
  }

  // Fixed filter logic matching Grocery.tsx pattern
  const filteredStores: ExtendedStore[] = storesData.filter((store) => {
    const hasValidCatalogs = Array.isArray(store?.catalogs);

    const meetsCategoryCriteria =
      filterSelected.category.length === 0 ||
      (Array.isArray(store.catalogs) &&
        store.catalogs.some(
          (catalog) =>
            typeof catalog?.category_id === "string" &&
            filterSelected.category.includes(catalog.category_id)
        ));

    const offerPercent = store?.calculated_max_offer?.percent ?? 0;
    const meetsOfferCriteria =
      filterSelected.offers === 0 || offerPercent >= filterSelected.offers;

    const deliveryTime = store?.time_to_ship_in_hours?.avg ?? Infinity;
    const meetsDeliveryCriteria =
      filterSelected.delivery === 100 || deliveryTime <= filterSelected.delivery;

    return (
      meetsCategoryCriteria &&
      meetsOfferCriteria &&
      meetsDeliveryCriteria
    );
  });

  return (
    <View style={{ flex: 1 }}>
      {/* domain search bar */}
      <View style={styles.headerContainer}>
        <Search
          placeholder="Search for food.."
          showBackArrow={true}
          showLocation={false}
          domain={domain}
        />
      </View>

      <ScrollView style={styles.container}>
        {/* food offer cards */}
        {offersData && offersData?.length > 0 ? (
          <Carousel
            loop
            width={screenWidth}
            height={containerHeight}
            autoPlay={true}
            data={offersData}
            scrollAnimationDuration={1000}
            autoPlayInterval={5000}
            renderItem={({ item, index }) => (
              <OfferCard3 offerData={item} key={index} />
            )}
          />
        ) : null}

        {/* explore food categories */}
        <View style={{ backgroundColor: "#fff", paddingBottom: 50 }}>
          {/* section header: {userDetails?.firstName} what's on your mind */}
          <View style={styles.subHeading}>
            <Text style={styles.subHeadingText}>
              {userDetails && userDetails?.firstName
                ? `${userDetails?.firstName}, whats on your mind ?`
                : "Whats on your mind ?"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/home/allCategories",
                  params: { category: "food" },
                });
              }}
            >
              <Text
                style={{ color: "#FF9130", fontSize: 14, fontWeight: "500" }}
              >
                See all
                <Entypo name="chevron-small-right" size={14} color="#FF9130" />
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* section items: domain subcategories */}
          <View style={styles.subCategories}>{renderSubCategories()}</View>

          <View style={styles.subHeading}>
            <Text style={styles.subHeadingText}>
              {storesData?.length > 0
                ? `Explore ${filteredStores?.length} Restaurants nearby`
                : "No Nearby Restaurants Found"}
            </Text>
          </View>

          {/* Filter Bar - Updated to match Grocery.tsx pattern */}
          <ScrollView
            horizontal
            style={{
              flexDirection: "row",
              marginHorizontal: 10,
              marginTop: 10,
            }}
          >
            {filters.map((filter, index) => {
              const isActive =
                (filter.name === "Category" && filterSelected.category.length > 0) ||
                (filter.name === "Offers" && filterSelected.offers > 0) ||
                (filter.name === "Delivery" && filterSelected.delivery < 100);

              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    borderWidth: 1,
                    borderColor: isActive ? "black" : "#EEEEEE",
                    backgroundColor: "white",
                    borderRadius: 100,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 5,
                    flexDirection: "row",
                  }}
                  onPress={() => {
                    handleOpenPress();
                    setActiveFilter(filter?.name);
                    setIsFilterVisible(true);
                    setFoodDetails({ ...foodDetails, visible: false });
                  }}
                >
                  <Text style={{ color: "black", fontWeight: "600" }}>
                    {{
                      Category:
                        "Category " +
                        (filterSelected.category.length > 0
                          ? `(${filterSelected.category.length})`
                          : ""),
                      Offers:
                        filterSelected.offers > 0
                          ? `${filterSelected.offers}% and above`
                          : "Offers",
                      Delivery:
                        filterSelected.delivery < 100
                          ? `${filterSelected.delivery} or min`
                          : "Delivery",
                    }[filter?.name]}
                  </Text>

                  {isActive && (
                    <Pressable
                      style={{ marginLeft: 5 }}
                      onPress={() => {
                        setFilterSelected({
                          category:
                            filter.name === "Category"
                              ? []
                              : filterSelected.category,
                          offers:
                            filter.name === "Offers" ? 0 : filterSelected.offers,
                          delivery:
                            filter.name === "Delivery"
                              ? 100
                              : filterSelected.delivery,
                        });
                      }}
                    >
                      <Feather name="x" size={16} color="black" />
                    </Pressable>
                  )}
                </TouchableOpacity>
              );
            })}

            {(filterSelected.category.length > 0 ||
              filterSelected.delivery !== 100 ||
              filterSelected.offers !== 0) && (
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#F13A3A",
                  backgroundColor: "white",
                  borderRadius: 100,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 10,
                }}
                onPress={() => {
                  setFilterSelected({
                    category: [],
                    offers: 0,
                    delivery: 100,
                  });
                }}
              >
                <Text style={{ color: "#F13A3A" }}>Reset</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          
          {/* restaurants info */}
          <View
            style={{
              marginVertical: 10,
              height: "100%",
              backgroundColor: "#f8f9fa",
            }}
          >
            {filteredStores.map((storeData: ExtendedStore, index: number) => (
              <StoreCard4
                categoryFiltered={filterSelected?.category}
                key={storeData?.id || index}
                storeData={storeData}
                foodDetails={setFoodDetails}
                handleOpenPress={handleOpenPress}
                index={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={bottonSheetIndex}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
        backgroundStyle={{
          backgroundColor: "#fff",
          borderRadius: 20,
        }}
        backdropComponent={renderBackdrop}
      >
        {isFilterVisible && !foodDetails.visible && (
          <FilterCard
            options={filters}
            activeOption={activeFilter}
            selectOption={setFilterSelected}
            categoryData={uniqueCategoryIds}
            filterSelected={filterSelected}
            offerData={offerData}
            deliveryData={deliveryData}
            setActiveOption={setActiveFilter}
            closeFilter={handleClosePress}
          />
        )}
        {foodDetails?.visible && (
          <FoodDetailsComponent 
            foodDetails={foodDetails} 
            closeFilter={handleClosePress}
          />
        )}
      </BottomSheet>
    </View>
  );
}

export default Food;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 10,
  },
  headerContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 5,
  },
  subCategories: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    marginVertical: 5,
    rowGap: 5,
  },
  subCategory: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: 3,
  },
  subCategoryImage: {},
  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
    marginHorizontal: 10,
  },
  subHeadingText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
    marginVertical: 10,
  },
  subCategoryName: {
    fontWeight: "400",
    fontSize: 12,
  },
});