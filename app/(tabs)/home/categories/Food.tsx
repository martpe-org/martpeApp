import React, { useState, useEffect, useMemo, useRef } from "react";
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

import OfferCard3 from "../../../../components/Categories/OfferCard3";
import StoreCard2 from "../../../../components/Categories/StoreCard2";
import Search from "../../../../components/common/Search";
import { fashionCategoryData } from "../../../../constants/categories";
import Loader from "../../../../components/common/Loader";
import { fetchHomeByDomain } from "../../../../hook/fetch-domain-data";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import FilterCard from "../../../../components/search/filterCard";
import { filters, offerData, deliveryData } from "../../../../constants/filters";
import { Entypo } from "@expo/vector-icons";

const domain = "ONDC:RET12";

function Fashion() {
  const [isFilterVisible] = useState(false);
  const [filterSelected, setFilterSelected] = useState<any>({
    category: [],
    offers: 0,
    delivery: 100,
  });
  const [activeFilter, setActiveFilter] = useState("");
  const [storesData, setStoresData] = useState<any[]>([]);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const response: any = await fetchHomeByDomain(
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

  const allCatalogs = Array.isArray(storesData)
    ? storesData.flatMap((store: any) => store?.catalogs || [])
    : [];

  const uniqueCategoryIds = Array.from(
    new Set(allCatalogs.map((c: any) => c?.category_id))
  ).map((category: any, index: number) => ({
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
      {fashionCategoryData.slice(0, 4).map((subCategory: any) => (
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
          <Image
            source={{ uri: subCategory.image }}
            style={styles.subCategoryImage}
          />
          <LinearGradient
            colors={["black", "rgba(0,0,0,0.1)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.subCategoryTextContainer}
          >
            <Text style={styles.subCategoryText}>{subCategory.name}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) return <Loader />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
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

        {offersData.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {offersData.map((data: any, index: number) => (
              <OfferCard3 offerData={data} key={index} />
            ))}
          </ScrollView>
        )}

        <View style={styles.subHeadingWrapper}>
          <Text style={styles.subHeadingText}>Explore by Category</Text>
        </View>
        {renderSubCategories()}

        <View style={styles.subHeadingWrapper}>
          <Text style={styles.subHeadingText}>Outlets Near me</Text>
        </View>

        {filteredStores.map((storeData: any) => (
          <StoreCard2
            key={storeData.id}
            storeData={storeData}
            categoryFiltered={filterSelected.category}
          />
        ))}
      </ScrollView>

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

export default Fashion;

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
    position: "relative",
    margin: 5,
    height: 160,
    width: 90,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  subCategoryImage: {
    width: "100%",
    height: "100%",
  },
  subCategoryTextContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
  },
  subCategoryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subHeadingWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  subHeadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
