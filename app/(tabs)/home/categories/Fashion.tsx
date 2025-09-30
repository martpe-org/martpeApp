import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { fashionCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import { styles } from "@/components/Categories/cat";
import { CategoryHeader, OffersCarousel, StoresSection, SubCategoriesSection } from "@/components/Categories/CategoryComponents";


function Fashion() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || selectedAddress || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.FASHION,
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

        {/* Shop by Category Section */}
        <SubCategoriesSection
          categoryData={fashionCategoryData}
          domain={DOMAINS.FASHION}
          sectionTitle="Shop by Category"
          searchCategory="fashion"
          useLinearGradient={false}
        />

        {/* Stores Section */}
        <StoresSection
          storesData={storesData}
          storesSectionTitle="Your Nearby Fashion Outlets"
          selectedAddress={selectedAddress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Fashion;