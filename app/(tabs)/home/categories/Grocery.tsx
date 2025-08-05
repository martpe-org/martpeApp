import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";

import StoreCard from "../../../../components/Categories/StoreCard";
import Search from "../../../../components/common/Search";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import { groceriesCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import Carousel from "react-native-reanimated-carousel";
import OfferCard3 from "../../../../components/Categories/OfferCard3";
import FilterCard from "../../../../components/search/filterCard";
import { useHideTabBarStore } from "../../../../state/hideTabBar";
import { filters, offerData, deliveryData } from "../../../../constants/filters";

const domain = "ONDC:RET10";

interface StoreType {
  id: string;
  domain?: string;
  catalogs?: {
    category_id?: string;
    [key: string]: any;
  }[];
  descriptor?: {
    name?: string;
    images?: string[];
    symbol?: string;
  };
  address?: {
    street?: string;
  };
  geoLocation?: {
    lat?: number;
    lng?: number;
  };
  calculated_max_offer?: {
    percent?: number;
  };
  time_to_ship_in_hours?: {
    avg?: number;
  };
}
interface HomeOfferType {
  id: string;
  calculated_max_offer?: {
    percent?: number;
  };
  descriptor?: {
    name?: string;
    symbol?: string;
  };
  // Add other fields as needed...
}



function Grocery() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const setHideTabBar = useHideTabBarStore((state) => state.setHideTabBar);
const [filterSelected, setFilterSelected] = useState<{
  category: string[];
  offers: number;
  delivery: number;
}>({
  category: [],
  offers: 0,
  delivery: 100,
});

  const screenWidth = Dimensions.get("window").width;
  const containerHeight = 200;
//  const [myArray, setMyArray] = useState<MyType[]>([]);
const [storesData, setStoresData] = useState<StoreType[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("");
const [offersData, setOffersData] = useState<HomeOfferType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [bottonSheetIndex, setBottonSheetIndex] = useState(-1);

  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["30%", "40%", "50%", "60%", "70%"], []);
  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenPress = () => bottomSheetRef.current?.expand();
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

  useEffect(() => {
    async function fetchData() {
      if (!selectedAddress?.lat || !selectedAddress?.lng) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchHomeByDomain(
          selectedAddress.lat,
          selectedAddress.lng,
          selectedAddress.pincode || "110001",
          domain
        );

        if (response) {
          setStoresData(Array.isArray(response.stores) ? response.stores : []);
          setOffersData(Array.isArray(response.offers) ? response.offers : []);
        }
      } catch (error) {
        console.error("Error fetching domain data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedAddress]);

  const allCatalogs =
    Array.isArray(storesData) && storesData.length > 0
      ? storesData.flatMap((store) => store?.catalogs || [])
      : [];

  const uniqueCategoryIds = Array.from(
    new Set(allCatalogs.map((catalog) => catalog?.category_id))
  ).map((category, index) => ({
    id: index + 1,
    label: category,
    value: category,
  }));

const filteredStores: StoreType[] = storesData.filter((store) => {
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




  if (isLoading) {
    return <Loader />;
  }

  if (!storesData && !offersData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "black", textAlign: "center", marginTop: 50 }}>
          No data available
        </Text>
      </View>
    );
  }

  const renderSubCategories = () =>
    groceriesCategoryData.slice(0, 6).map((subCategory) => (
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
          colors={["#E3F9BE", "rgba(231, 223, 201, 0)"]}
          style={styles.subCategoryImage}
        >
          <Image
            source={{ uri: subCategory.image }}
            resizeMode="contain"
            style={{ width: 100, height: 80 }}
          />
        </LinearGradient>
        <Text numberOfLines={1} style={styles.subCategoryName}>
          {subCategory?.name}
        </Text>
      </TouchableOpacity>
    ));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Search
          placeholder="Search for groceries.."
          showBackArrow={true}
          showLocation={false}
          domain={domain}
        />
      </View>

      <ScrollView style={styles.container}>
        {offersData && offersData.length > 0 && (
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
        )}

        <View style={{ backgroundColor: "#fff" }}>
          <View style={styles.subHeading}>
            <Text style={styles.subHeadingText}>Explore by Categories</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "../(tabs)/home/categories",
                  params: { category: "Grocery" },
                })
              }
            >
              <Text style={{ color: "#FF9130", fontSize: 14, fontWeight: "500" }}>
                See all{" "}
                <Entypo name="chevron-small-right" size={14} color="#FF9130" />
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subCategories}>{renderSubCategories()}</View>

          <View style={styles.subHeading}>
            <Text style={styles.subHeadingText}>
              {storesData?.length > 0
                ? `Explore ${filteredStores?.length} Stores Near me`
                : "No Nearby Stores Found"}
            </Text>
          </View>

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

          <View style={styles.subHeading}>
            <Text style={styles.subHeadingText}>Stores Near me</Text>
          </View>

          <View style={{ backgroundColor: "#f7f7f8" }}>
            {filteredStores.map((storeData) => (
              <StoreCard
                categoryFiltered={filterSelected.category}
                key={storeData?.id}
                storeData={storeData}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={bottonSheetIndex}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
        backgroundStyle={{ backgroundColor: "#fff", borderRadius: 20 }}
        backdropComponent={renderBackdrop}
      >
        {isFilterVisible && (
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
      </BottomSheet>
    </View>
  );
}

export default Grocery;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
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
    justifyContent: "center",
    flexWrap: "wrap",
    marginHorizontal: 2,
  },
  subCategory: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 7,
    marginVertical: 10,
  },
  subCategoryName: {
    fontWeight: "400",
    fontSize: 10,
    maxWidth: 100,
  },
  subCategoryImage: {
    alignItems: "center",
    justifyContent: "flex-end",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginHorizontal: 20,
  },
  subHeadingText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
    marginVertical: 10,
  },
});