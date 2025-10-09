import { router } from "expo-router";
import React from "react";
import { SafeAreaView, FlatList, Text, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { homeAndDecorCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import {
  CategoryHeader,
  OffersCarousel,
  ProductsSection,
  SubCategoriesSection,
} from "@/components/Categories/CategoryComponents";
import { styles } from "@/components/Categories/cat";

function Interior() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.HOME_DECOR,
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const productsData = domainData?.stores || []; // ProductResultsWrapper-compatible data

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
        data={[{ key: "content" }]} // dummy one-item data
        keyExtractor={(item) => item.key}

        // 🧩 Header components
        ListHeaderComponent={
          <View>
            <CategoryHeader onSearchPress={handleSearchPress} />
            <OffersCarousel storesData={productsData} activeColor="#E11D48" />
            <SubCategoriesSection
              categoryData={homeAndDecorCategoryData}
              domain={DOMAINS.HOME_DECOR}
              sectionTitle="Explore by Category"
              searchCategory="interior"
            />
          </View>
        }

        // 🪑 Products list (replaces StoresSection)
        renderItem={() => (
          <ProductsSection
            initialProductsData={productsData}
            category="Stores near You"
            domain={DOMAINS.HOME_DECOR}
            selectedAddress={selectedAddress}
          />
        )}

        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

export default Interior;
