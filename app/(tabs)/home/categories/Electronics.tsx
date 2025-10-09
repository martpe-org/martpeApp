import { router } from "expo-router";
import React from "react";
import { SafeAreaView, FlatList, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { electronicsCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import {
  CategoryHeader,
  OffersCarousel,
  ProductsSection,
  SubCategoriesSection,
} from "@/components/Categories/CategoryComponents";
import { styles } from "@/components/Categories/cat";

function Electronics() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.ELECTRONICS,
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const productsData = domainData?.stores || []; // use same structure, ProductResultsWrapper handles it

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
      <FlatList
        data={[{ key: "content" }]} // dummy one-item data
        keyExtractor={(item) => item.key}

        // 🧩 Header with search + offers + subcategories
        ListHeaderComponent={
          <View>
            <CategoryHeader onSearchPress={handleSearchPress} />
            <OffersCarousel storesData={productsData} activeColor="#E11D48" />
            <SubCategoriesSection
              categoryData={electronicsCategoryData}
              domain={DOMAINS.ELECTRONICS}
              sectionTitle="Explore New Gadgets"
              searchCategory="electronics"
            />
          </View>
        }

        // 🛒 Render the dynamic product list (instead of StoresSection)
        renderItem={() => (
          <ProductsSection
            initialProductsData={productsData}
            category="Stores near You"
            domain={DOMAINS.ELECTRONICS}
            selectedAddress={selectedAddress}
          />
        )}

        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

export default Electronics;
