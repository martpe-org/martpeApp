import React, { useState, useEffect, useRef, useMemo } from "react";
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
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import OfferCard3 from "../../../../components/Categories/OfferCard3";
import StoreCard3 from "../../../../components/Categories/StoreCard3";
import Search from "../../../../components/common/Search";
import { homeAndDecorCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import FilterCard from "../../../../components/search/filterCard";
import { filters, offerData, deliveryData } from "../../../../constants/filters";
import { Entypo, Feather } from "@expo/vector-icons";

const domain = "ONDC:RET16";

interface Store {
  id: string;
  catalogs?: { category_id: string }[];
  calculated_max_offer?: { percent?: number };
  time_to_ship_in_hours?: { avg?: number };
}

interface Offer {
  id?: string;
  [key: string]: any;
}

function Interior() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [filterSelected, setFilterSelected] = useState({
    category: [] as string[],
    offers: 0,
    delivery: 100,
  });

  const [storesData, setStoresData] = useState<Store[]>([]);
  const [offersData, setOffersData] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);

  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  // Fetch Data
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
          selectedAddress.pincode || "110044",
          domain
        );

        setStoresData(Array.isArray(response?.stores) ? response.stores : []);
        setOffersData(Array.isArray(response?.offers) ? response.offers : []);
      } catch (error) {
        console.error("Error fetching home decor data:", error);
        setStoresData([]);
        setOffersData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedAddress]);
  const handleSearchPress = () => {
    router.push("/search");
  };
  // Flatten catalogs safely
  const allCatalogs = storesData.flatMap((store) =>
    Array.isArray(store?.catalogs) ? store.catalogs : []
  );

  // Extract unique category IDs
  const uniqueCategoryIds = Array.from(
    new Set(allCatalogs.map((c) => c?.category_id).filter(Boolean))
  ).map((category, index) => ({
    id: index + 1,
    label: category!,
    value: category!,
  }));

  // Subcategories UI
  const renderSubCategories = () => {
    return homeAndDecorCategoryData.slice(0, 6).map((subCategory) => (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: subCategory.name, domainData: domain },
          });
        }}
        style={styles.subCategory}
        key={subCategory.id}
      >
        <LinearGradient
          colors={["#F9E7B0", "rgba(231, 223, 201, 0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.subCategoryImage}
        >
          <Image
            source={{ uri: subCategory.image }}
            resizeMode="contain"
            style={{ width: 110, height: 90 }}
          />
        </LinearGradient>
        <Text style={styles.subCategoryText}>{subCategory.name}</Text>
      </TouchableOpacity>
    ));
  };

  // Apply filters
  const filteredStores = storesData.filter((store) => {
    const meetsCategoryCriteria =
      filterSelected.category.length === 0 ||
      store?.catalogs?.some((catalog) =>
        filterSelected.category.includes(catalog.category_id)
      );
    const meetsOfferCriteria =
      filterSelected.offers === 0 ||
      (store?.calculated_max_offer?.percent ?? 0) >= filterSelected.offers;
    const meetsDeliveryCriteria =
      filterSelected.delivery === 100 ||
      (store?.time_to_ship_in_hours?.avg ?? Infinity) <=
        filterSelected.delivery;

    return meetsCategoryCriteria && meetsOfferCriteria && meetsDeliveryCriteria;
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!storesData.length && !offersData.length) {
    return (
      <Text style={{ color: "black", textAlign: "center", marginTop: 20 }}>
        No data available
      </Text>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Entypo name="chevron-left" size={22} color="#111" />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <Search onPress={handleSearchPress} />
        </View>
      </View>

        {/* Offers Slider */}
        {offersData.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {offersData.map((data, index) => (
              <OfferCard3 offerData={data} key={index} />
            ))}
          </ScrollView>
        )}

        {/* Categories */}
        <View>
          <View style={styles.subHeading}>
            <View style={styles.line} />
            <Text style={styles.subHeadingText}>Explore by Category</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.subCategories}>{renderSubCategories()}</View>

          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/(tabs)/home/allCategories",
                params: { category: "homeAndDecor" },
              });
            }}
            style={styles.viewMoreButton}
          >
            <Text style={styles.viewMoreButtonText}>View More</Text>
          </TouchableOpacity>

          {/* Store Section */}
          <View style={styles.subHeading}>
            <Text style={styles.subHeadingText}>
              {storesData.length > 0
                ? `Explore ${filteredStores.length} Stores Near Me`
                : "No Nearby Stores Found"}
            </Text>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal>
            <View style={{ flexDirection: "row", marginVertical: 10 }}>
              {filters.map((filter, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      (filter.name === "Category" &&
                        filterSelected.category.length > 0) ||
                      (filter.name === "Offers" &&
                        filterSelected.offers > 0) ||
                      (filter.name === "Delivery" &&
                        filterSelected.delivery < 100)
                        ? "black"
                        : "#EEEEEE",
                    backgroundColor: "white",
                    borderRadius: 100,
                    paddingHorizontal: Dimensions.get("screen").width * 0.03,
                    paddingVertical: Dimensions.get("screen").width * 0.015,
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 5,
                  }}
                  onPress={() => {
                    handleOpenPress();
                    setActiveFilter(filter?.name);
                    setIsFilterVisible(true);
                  }}
                >
                  <Text style={{ color: "black", fontWeight: "600" }}>
                    {
                      {
                        Category:
                          "Category " +
                          (filterSelected.category.length > 0
                            ? `(${filterSelected.category.length})`
                            : ""),
                        Offers:
                          filterSelected.offers > 0
                            ? filterSelected.offers + "% and above"
                            : "Offers",
                        Delivery:
                          filterSelected.delivery < 100
                            ? filterSelected.delivery + " or min"
                            : "Delivery",
                      }[filter?.name]
                    }
                  </Text>

                  <TouchableOpacity
                    style={{
                      display:
                        (filter.name === "Category" &&
                          filterSelected.category.length > 0) ||
                        (filter.name === "Offers" &&
                          filterSelected.offers > 0) ||
                        (filter.name === "Delivery" &&
                          filterSelected.delivery < 100)
                          ? "flex"
                          : "none",
                      marginLeft: 5,
                    }}
                    onPress={() => {
                      setFilterSelected({
                        category:
                          filter.name === "Category"
                            ? []
                            : filterSelected.category,
                        offers:
                          filter.name === "Offers"
                            ? 0
                            : filterSelected.offers,
                        delivery:
                          filter.name === "Delivery"
                            ? 100
                            : filterSelected.delivery,
                      });
                    }}
                  >
                    <Feather name="x" size={16} color="black" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

              {(filterSelected.category.length > 0 ||
                filterSelected.delivery !== 100 ||
                filterSelected.offers !== 0) && (
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: "#F13A3A",
                    backgroundColor: "white",
                    borderRadius: 100,
                    paddingHorizontal: 15,
                    paddingVertical: 5,
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
            </View>
          </ScrollView>

          {/* Store Cards */}
          {filteredStores.map((storeData) => (
            <StoreCard3
              categoryFiltered={filterSelected.category}
              key={storeData.id}
              storeData={storeData}
              color="yellow"
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Sheet Filter */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
        backgroundStyle={{
          backgroundColor: "#fff",
          borderRadius: 20,
        }}
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

export default Interior;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 15,
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
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginVertical: 8,
    gap: 5,
  },
  subCategory: {
    alignItems: "center",
    margin: 2,
  },
  subCategoryImage: {
    marginBottom: 5,
    borderRadius: 15,
  },
  subCategoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
    marginHorizontal: 10,
  },
  subHeadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  viewMoreButton: {
    flexDirection: "row",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#898989",
  },
  viewMoreButtonText: {
    color: "#FB9191",
    fontSize: 12,
    fontWeight: "500",
  },
});
