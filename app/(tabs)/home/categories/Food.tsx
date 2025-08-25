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
  Pressable,
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
import { Entypo, Feather } from "@expo/vector-icons";
import FilterCard from "../../../../components/search/filterCard";

const domain = "ONDC:RET11";
const screenWidth = Dimensions.get("window").width;

function Food() {
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setIsFilterVisible(false);
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  // Fetch domain data
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
          domain,
          1,
          20
        );
        setStoresData(
          Array.isArray(response?.stores?.items) ? response.stores.items : []
        );
        setOffersData(Array.isArray(response?.offers) ? response.offers : []);
      } catch (error) {
        console.error("Error fetching domain data:", error);
      } finally {
        setIsLoading(false);
      }
    }
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

  const renderSubCategories = () =>
    foodCategoryData.slice(0, 8).map((subCategory) => (
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
            style={{ width: 80, height: 60 }}
          />
        </View>
        <Text style={styles.subCategoryName}>{subCategory.name}</Text>
      </TouchableOpacity>
    ));

  if (isLoading) return <Loader />;

  if (!storesData.length && !offersData.length) {
    return (
      <View style={styles.container}>
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
        <Text style={{ color: "black", textAlign: "center", justifyContent:"center",alignItems:"center" }}>
          No restaurants available in your area
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        {/* {/* <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Entypo name="chevron-left" size={22} color="#111" />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <Search onPress={handleSearchPress} />
        </View> */}
      </View> 

      <ScrollView style={styles.container}>
        {/* Offers */}
        {offersData.length > 0 && (
          <View style={{ height: 200 }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {offersData.map((data, index) => (
                <View key={index} style={{ width: screenWidth }}>
                  <OfferCard3 offerData={data} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.subHeading}>
          <Text style={styles.subHeadingText}>What’s on your mind?</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/home/allCategories",
                params: { category: "food" },
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

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ margin: 10 }}
        >
          {filters.map((filter, index) => {
            const isActive =
              (filter.name === "Category" &&
                filterSelected.category.length > 0) ||
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
                  bottomSheetRef.current?.expand();
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
                    onPress={() =>
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
                      })
                    }
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

export default Food;

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
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    marginVertical: 5,
    rowGap: 5,
  },
  subCategory: { flexDirection: "column", alignItems: "center", margin: 3 },
  subCategoryImage: {},
  subCategoryName: { fontWeight: "400", fontSize: 12 },
  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginHorizontal: 20,
  },
  subHeadingText: { fontSize: 14, fontWeight: "600", marginVertical: 10 },
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
