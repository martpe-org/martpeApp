import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { personalCareCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import { styles } from "@/components/Categories/cat";
import { CategoryHeader, OffersCarousel, StoresSection, SubCategoriesSection } from "@/components/Categories/CategoryComponents";


function Beauty() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || selectedAddress || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.PERSONAL_CARE,
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

  if (!storesData.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
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

        {/* Explore the World of Beauty Section */}
        <SubCategoriesSection
          categoryData={personalCareCategoryData}
          domain={DOMAINS.PERSONAL_CARE}
          sectionTitle="Explore the World of Beauty"
          searchCategory="beauty"
          useLinearGradient={true}
          gradientColors={["#faf7f9", "rgba(255, 146, 211, 0)"]}
        />

        {/* Stores Section */}
        <StoresSection
          storesData={storesData}
          storesSectionTitle="Your Nearby Beauty Stores"
          selectedAddress={selectedAddress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Beauty;