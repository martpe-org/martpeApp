import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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
import { filters, offerData, deliveryData } from "../../../../constants/filters";

const domain = "ONDC:RET10";

function Grocery() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterSelected, setFilterSelected] = useState({
    category: [] as string[],
    offers: 0,
    delivery: 100,
  });

  const screenWidth = Dimensions.get("window").width;
  const containerHeight = 200;

  const [storesData, setStoresData] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [offersData, setOffersData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bottonSheetIndex] = useState(-1);

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

  const handleSearchPress = () => {
    router.push("/search");
  };

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
      ? storesData.flatMap((store: any) => store?.catalogs || [])
      : [];

  const uniqueCategoryIds = Array.from(
    new Set(allCatalogs.map((catalog: any) => catalog?.category_id))
  ).map((category, index) => ({
    id: index + 1,
    label: category,
    value: category,
  }));

  const filteredStores = storesData.filter((store: any) => {
    const meetsCategoryCriteria =
      filterSelected.category.length === 0 ||
      (Array.isArray(store.catalogs) &&
        store.catalogs.some(
          (catalog: any) =>
            typeof catalog?.category_id === "string" &&
            filterSelected.category.includes(catalog.category_id)
        ));

    const offerPercent = store?.calculated_max_offer?.percent ?? 0;
    const meetsOfferCriteria =
      filterSelected.offers === 0 || offerPercent >= filterSelected.offers;

    const deliveryTime = store?.time_to_ship_in_hours?.avg ?? Infinity;
    const meetsDeliveryCriteria =
      filterSelected.delivery === 100 || deliveryTime <= filterSelected.delivery;

    return meetsCategoryCriteria && meetsOfferCriteria && meetsDeliveryCriteria;
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Entypo name="chevron-left" size={22} color="#111" />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <Search onPress={handleSearchPress} />
        </View>
      </View>

      <ScrollView style={styles.container}>
        {offersData && offersData.length > 0 && (
          <Carousel
            loop
            width={screenWidth}
            height={containerHeight}
            autoPlay
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
                See all {" "}
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
            style={{ flexDirection: "row", marginHorizontal: 10, marginTop: 10 }}
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
                    <TouchableOpacity
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
                    </TouchableOpacity>
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
                  setFilterSelected({ category: [], offers: 0, delivery: 100 });
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
            {filteredStores.map((storeData: any) => (
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 6,
    marginTop: 11,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  searchWrapper: {
    flex: 1,
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
