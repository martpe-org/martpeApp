import { router } from "expo-router";
import React from "react";
import { SafeAreaView, FlatList, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { foodCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import {
  CategoryHeader,
  OffersCarousel,
  ProductsSection,
  SubCategoriesSection,
} from "@/components/Categories/CategoryComponents";
import { styles } from "@/components/Categories/cat";

function Food() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || "110001";

  const { data: domainData, isLoading } = useDomainData(
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
    router.push("/search/search");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={[{ key: "content" }]} // dummy single item for layout consistency
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            {/* ðŸ” Search Header */}
            <CategoryHeader onSearchPress={handleSearchPress} />

            {/* ðŸ·ï¸ Offers Carousel */}
            <OffersCarousel storesData={storesData} activeColor="#f2663c" />

            {/* ðŸ” Subcategories */}
            <SubCategoriesSection
              categoryData={foodCategoryData}
              domain={DOMAINS.FOOD}
              sectionTitle="Shop by Categories"
              searchCategory="food"
              useLinearGradient={true}
              gradientColors={["#f5f3ee", "rgba(231, 223, 201, 0)"]}
            />
          </View>
        }
        renderItem={() => (
          <ProductsSection
            initialProductsData={storesData}
            category="Restaurants near You"
            domain={DOMAINS.FOOD}
            selectedAddress={selectedAddress}
          />
        )}
      />
    </SafeAreaView>
  );
}

export default Food;