import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { electronicsCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import { styles } from "@/components/Categories/cat";
import { CategoryHeader, OffersCarousel, StoresSection, SubCategoriesSection } from "@/components/Categories/CategoryComponents";


function Electronics() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || selectedAddress || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.ELECTRONICS,
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
    router.push("/search");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <CategoryHeader onSearchPress={handleSearchPress} />

        {/* Offers Section with auto-scroll + dots */}
        <OffersCarousel storesData={storesData} activeColor="#E11D48" />

        {/* Explore Gadgets Section */}
        <SubCategoriesSection
          categoryData={electronicsCategoryData}
          domain={DOMAINS.ELECTRONICS}
          sectionTitle="Explore New Gadgets"
          searchCategory="electronics"
          useLinearGradient={false}
        />

        {/* Stores Section */}
<StoresSection 
  storesData={storesData}
  storesSectionTitle="Electronics Stores Near You"
  selectedAddress={selectedAddress}
  showNoStoresAnimation={true} // Add this if you want the animation when no stores are found
/>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Electronics;