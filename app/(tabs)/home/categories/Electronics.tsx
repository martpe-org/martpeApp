import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import BottomSheet, {
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import OfferCard3 from "../../../../components/Categories/OfferCard3";
import StoreCard3 from "../../../../components/Categories/StoreCard3";
import Search from "../../../../components/common/Search";
import { electronicsCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import { useHideTabBarStore } from "../../../../state/hideTabBar";
import { filters, offerData, deliveryData } from "../../../../constants/filters";
import { Entypo, Feather } from "@expo/vector-icons";
import FilterCard from "../../../../components/search/filterCard";

const domain = "ONDC:RET14";
function Electronics() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterSelected, setFilterSelected] = useState({
    category: [] as string[],
    offers: 0,
    delivery: 100,
  });
  const [storesData, setStoresData] = useState<any[]>([]);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const setHideTabBar = useHideTabBarStore((state) => state.setHideTabBar);

  // ✅ properly type the BottomSheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // BottomSheet snap points
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setIsFilterVisible(false);
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    []
  );

  // Fetch data
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
        setStoresData(Array.isArray(response?.stores) ? response.stores : []);
        setOffersData(Array.isArray(response?.offers) ? response.offers : []);
      } catch (error) {
        console.error("Error fetching domain data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedAddress]);

  // Categories for filter
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

  // Apply filters
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

  // Render subcategories
  const renderSubCategories = () =>
    electronicsCategoryData.slice(0, 8).map((subCategory) => (
      <TouchableOpacity
        key={subCategory.id}
        style={styles.subCategory}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: subCategory.name, domainData: domain },
          })
        }
      >
        <View style={styles.subCategoryImage}>
          <Image
            source={{ uri: subCategory.image }}
            resizeMode="contain"
            style={{ width: 80, height: 80 }}
          />
        </View>
        <Text style={styles.subHeadingText}>{subCategory.name}</Text>
      </TouchableOpacity>
    ));

  if (isLoading) return <Loader />;

  if (storesData.length === 0 && offersData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "black", textAlign: "center", marginTop: 50 }}>
          No data available
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Header with Back + Search */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
        <View key={index} style={{ width: Dimensions.get("window").width }}>
          <OfferCard3 offerData={data} />
        </View>
      ))}
    </ScrollView>
  </View>
)}


        {/* SubCategories */}
        <View>
          <View style={styles.subHeading}>
            <View style={styles.line} />
            <Text style={styles.subHeadingText}>Explore New Gadgets</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.subCategories}>{renderSubCategories()}</View>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/home/allCategories",
                params: { category: "electronics" },
              })
            }
          >
            <Text style={styles.viewMoreButtonText}>View More</Text>
          </TouchableOpacity>

          {/* Filters */}
          <View style={styles.subHeading}>
            <View style={styles.line} />
            <Text style={styles.subHeadingText}>Outlets Near me</Text>
            <View style={styles.line} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ margin: 10 }}>
            {filters.map((filter, index) => {
              const isActive =
                (filter.name === "Category" && filterSelected.category.length > 0) ||
                (filter.name === "Offers" && filterSelected.offers > 0) ||
                (filter.name === "Delivery" && filterSelected.delivery < 100);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterChip,
                    { borderColor: isActive ? "black" : "#eee" },
                  ]}
                  onPress={() => {
                    setActiveFilter(filter.name);
                    setIsFilterVisible(true);
                    bottomSheetRef.current?.expand(); // ✅ now typed
                  }}
                >
                  <Text style={{ color: "black", fontWeight: "600" }}>
                    {filter.name === "Category"
                      ? `Category ${
                          filterSelected.category.length > 0
                            ? `(${filterSelected.category.length})`
                            : ""
                        }`
                      : filter.name === "Offers"
                      ? filterSelected.offers > 0
                        ? `${filterSelected.offers}% and above`
                        : "Offers"
                      : filter.name === "Delivery"
                      ? filterSelected.delivery < 100
                        ? `min ${filterSelected.delivery} hrs`
                        : "Delivery"
                      : filter.name}
                  </Text>

                  {isActive && (
                    <Pressable
                      onPress={() => {
                        setFilterSelected({
                          category: filter.name === "Category" ? [] : filterSelected.category,
                          offers: filter.name === "Offers" ? 0 : filterSelected.offers,
                          delivery:
                            filter.name === "Delivery" ? 100 : filterSelected.delivery,
                        });
                      }}
                      style={{ marginLeft: 5 }}
                    >
                      <Feather name="x" size={16} color="black" />
                    </Pressable>
                  )}
                </TouchableOpacity>
              );
            })}

            {(filterSelected.category.length > 0 ||
              filterSelected.offers > 0 ||
              filterSelected.delivery < 100) && (
              <TouchableOpacity
                style={[styles.filterChip, { borderColor: "#F13A3A" }]}
                onPress={() =>
                  setFilterSelected({ category: [], offers: 0, delivery: 100 })
                }
              >
                <Text style={{ color: "#F13A3A" }}>Reset</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Stores */}
          {filteredStores.map((store) => (
            <StoreCard3
              key={store?.id}
              storeData={store}
              categoryFiltered={filterSelected.category}
              color="red"
            />
          ))}
        </View>
      </ScrollView>

      {/* BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={() => setIsFilterVisible(false)}
        backgroundStyle={{ backgroundColor: "#fff" }}
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

export default Electronics;

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

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
    marginTop:11,
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
    justifyContent: "center",
    marginVertical: 8,
    gap: 5,
  },
  subCategory: {
    alignItems: "center",
    margin: 5,
  },
  subCategoryImage: {
    backgroundColor: "#FEEEEE",
    marginBottom: 5,
    borderRadius: 10,
    elevation: 4,
    padding: 10,
  },
  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    marginHorizontal: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: "black", marginHorizontal: 10 },
  subHeadingText: { fontSize: 14, fontWeight: "500" },
  viewMoreButton: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#898989",
  },
  viewMoreButtonText: { color: "#FB9191", fontSize: 12, fontWeight: "500" },
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
});
