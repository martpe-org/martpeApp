import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import StoreCard from "../../../../components/Categories/StoreCard";
import OfferCard2 from "../../../../components/Categories/Offercard2";
import Search from "../../../../components/common/Search";
import { personalCareCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import useUserDetails from "../../../../hook/useUserDetails";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import FilterCard from "../../../../components/search/filterCard";
import { filters, offerData, deliveryData } from "../../../../constants/filters";
import { Entypo } from "@expo/vector-icons";

const domain = "ONDC:RET13";
const domainColor = "#242929";

function Beauty() {
  const [isFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [filterSelected, setFilterSelected] = useState({
    category: [] as string[],
    offers: 0,
    delivery: 100,
  });
  const [storesData, setStoresData] = useState<any[]>([]);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { userDetails, getUserDetails } = useUserDetails();
  const selectedAddress = useDeliveryStore((state: any) => state.selectedDetails);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const handleClosePress = () => bottomSheetRef.current?.close();
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
    getUserDetails();
  }, []);

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

  const handleSearchPress = () => {
    router.push("/search");
  };

  const allCatalogs = Array.isArray(storesData)
    ? storesData.flatMap((store: any) => store?.catalogs || [])
    : [];

  const uniqueCategoryIds = Array.from(
    new Set(allCatalogs.map((c: any) => c?.category_id))
  ).map((category, index) => ({
    id: index + 1,
    label: category,
    value: category,
  }));

  const filteredStores = storesData.filter((store: any) => {
    const meetsCategoryCriteria =
      filterSelected.category.length === 0 ||
      store?.catalogs?.some((catalog: any) =>
        filterSelected.category.includes(catalog?.category_id)
      );

    const meetsOfferCriteria =
      filterSelected.offers === 0 ||
      (store?.calculated_max_offer?.percent ?? 0) >= filterSelected.offers;

    const meetsDeliveryCriteria =
      filterSelected.delivery === 100 ||
      (store?.time_to_ship_in_hours?.avg ?? Infinity) <=
        filterSelected.delivery;

    return (
      meetsCategoryCriteria && meetsOfferCriteria && meetsDeliveryCriteria
    );
  });

  const renderSubCategories = () => (
    <View style={styles.subCategories}>
      {personalCareCategoryData.slice(0, 8).map((subCategory: any) => (
        <TouchableOpacity
          key={subCategory.id}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/home/result/[search]",
              params: { search: subCategory.name, domainData: domain },
            })
          }
          style={styles.subCategory}
        >
          <LinearGradient
            colors={["#FDBAE2", "rgba(255, 146, 211, 0)"]}
            style={styles.subCategoryImage}
          >
            <Image
              source={{ uri: subCategory.image }}
              resizeMode="contain"
              style={{ width: 70, height: 70 }}
            />
          </LinearGradient>
          <Text style={styles.subCategoryName}>{subCategory.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) return <Loader />;

  return (
    <View style={styles.container}>
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

      <ScrollView>
        {/* Offers */}
        {offersData.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {offersData.map((data, index) => (
              <OfferCard2 offerData={data} key={index} />
            ))}
          </ScrollView>
        )}

        {/* Subheading */}
        <Text style={styles.subHeadingText}>
          {userDetails?.firstName ? `Hey ${userDetails.firstName}, ` : ""}
          Explore the world of beauty
        </Text>

        {/* SubCategories */}
        {renderSubCategories()}

        {/* Stores */}
        <View style={styles.subHeading}>
          <Text style={styles.subHeadingText}>
            {filteredStores.length > 0
              ? `Explore ${filteredStores.length} Stores Near me`
              : "No Nearby Stores Found"}
          </Text>
        </View>

        {filteredStores.map((storeData: any) => (
          <StoreCard
            key={storeData?.id}
            storeData={storeData}
            categoryFiltered={filterSelected.category}
          />
        ))}
      </ScrollView>

      {/* BottomSheet Filter */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
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

export default Beauty;

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
  searchWrapper: { flex: 1 },
  subCategories: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  subCategory: { alignItems: "center", margin: 6 },
  subCategoryImage: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 10,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  subCategoryName: { textAlign: "center", fontSize: 10, fontWeight: "500" },
  subHeading: { marginTop: 20, alignItems: "center" },
  subHeadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: domainColor,
    marginBottom: 10,
  },
});
