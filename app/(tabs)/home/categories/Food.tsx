import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { foodCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import { styles } from "@/components/Categories/cat";
import { CategoryHeader, createRefreshControl, OffersCarousel, StoresSection, SubCategoriesSection } from "@/components/Categories/CategoryComponents";


function Food() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || selectedAddress || "110001";

  const {
    data: domainData,
    isLoading,
    refetch,
  } = useDomainData(
    DOMAINS.FOOD,
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const storesData = domainData?.stores || [];

  if (isLoading && !domainData) {
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
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={createRefreshControl(isLoading, refetch, "#f2663c")}
      >
        {/* Search Header */}
        <CategoryHeader onSearchPress={handleSearchPress} />

        {/* Offers Section with auto-scroll + dots */}
        <OffersCarousel storesData={storesData} activeColor="#f2663c" />

        {/* Categories Section */}
        <SubCategoriesSection
          categoryData={foodCategoryData}
          domain={DOMAINS.FOOD}
          sectionTitle="What's on your mind?"
          searchCategory="food"
          useLinearGradient={true}
          gradientColors={["#f5f3ee", "rgba(231, 223, 201, 0)"]}
        />

        {/* Stores Section */}
        <StoresSection
          storesData={storesData}
          storesSectionTitle="Your Nearby Restaurants"
          selectedAddress={selectedAddress}
          showNoStoresAnimation={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Food;