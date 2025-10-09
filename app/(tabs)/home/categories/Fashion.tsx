import { router } from "expo-router";
import React from "react";
import { SafeAreaView, FlatList, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { fashionCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import {
  CategoryHeader,
  OffersCarousel,
  ProductsSection,
  SubCategoriesSection,
} from "@/components/Categories/CategoryComponents";
import { styles } from "@/components/Categories/cat";

function Fashion() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.FASHION,
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const productsData = domainData?.stores || []; // same structure used by ProductResultsWrapper

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
        data={[{ key: "content" }]} // dummy one-item array
        keyExtractor={(item) => item.key}

        // 🧩 Header — search bar, offers, and categories
        ListHeaderComponent={
          <View>
            <CategoryHeader onSearchPress={handleSearchPress} />
            <OffersCarousel storesData={productsData} activeColor="#E11D48" />
            <SubCategoriesSection
              categoryData={fashionCategoryData}
              domain={DOMAINS.FASHION}
              sectionTitle="Shop by Category"
              searchCategory="fashion"
            />
          </View>
        }

        // 👚 Render the actual fashion product list
        renderItem={() => (
          <ProductsSection
            initialProductsData={productsData}
            category="Store near You"
            domain={DOMAINS.FASHION}
            selectedAddress={selectedAddress}
          />
        )}

        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

export default Fashion;
