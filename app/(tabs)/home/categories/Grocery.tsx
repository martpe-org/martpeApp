import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { groceriesCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import { styles } from "@/components/Categories/cat";
import { CategoryHeader, OffersCarousel, StoresSection, SubCategoriesSection } from "@/components/Categories/CategoryComponents";


function Grocery() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || selectedAddress || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.GROCERY,
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const storesData = domainData?.stores || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader />
      </SafeAreaView>
    );
  }

  const handleSearchPress = () => {
    router.push("/search/search");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <CategoryHeader onSearchPress={handleSearchPress} />

        {/* Offers Section with auto-scroll + dots */}
        <OffersCarousel storesData={storesData} activeColor="#E11D48" />

        {/* Explore by Categories Section */}
        <SubCategoriesSection
          categoryData={groceriesCategoryData}
          domain={DOMAINS.GROCERY}
          sectionTitle="Explore by Categories"
          searchCategory="grocery"
          useLinearGradient={true}
          gradientColors={["#ffffff", "#f0fdf4", "#dcfce7"]}
        />

        {/* Stores Section */}
        <StoresSection
          storesData={storesData}
          storesSectionTitle="Your Nearby Grocery Stores"
          selectedAddress={selectedAddress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Grocery;