import { router } from "expo-router";
import React from "react";
import { SafeAreaView, FlatList, Text, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { personalCareCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import {
  CategoryHeader,
  OffersCarousel,
  ProductsSection,
  SubCategoriesSection,
} from "@/components/Categories/CategoryComponents";
import { styles } from "@/components/Categories/cat";

function Beauty() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.PERSONAL_CARE,
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const productsData = domainData?.stores || []; // compatible with ProductResultsWrapper

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (!productsData.length) {
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
      <FlatList
        data={[{ key: "content" }]} // dummy single-item data
        keyExtractor={(item) => item.key}

        // 🧩 Header components
        ListHeaderComponent={
          <View>
            <CategoryHeader onSearchPress={handleSearchPress} />
            <OffersCarousel storesData={productsData} activeColor="#E11D48" />
            <SubCategoriesSection
              categoryData={personalCareCategoryData}
              domain={DOMAINS.PERSONAL_CARE}
              sectionTitle="Shop by Category"
              searchCategory="beauty"
            />
          </View>
        }
        renderItem={() => (
          <ProductsSection
            initialProductsData={productsData}
            category="Stores near You"
            domain={DOMAINS.PERSONAL_CARE}
            selectedAddress={selectedAddress}
          />
        )}

        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

export default Beauty;
