import { router } from "expo-router";
import React from "react";
import { SafeAreaView, FlatList, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { groceriesCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import { styles } from "@/components/Categories/cat";
import {
  CategoryHeader,
  OffersCarousel,
  ProductsSection,
  SubCategoriesSection,
} from "@/components/Categories/CategoryComponents";

function Grocery() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || "110001";

  const { data: domainData, isLoading } = useDomainData(
    DOMAINS.GROCERY,
    selectedAddress?.lat,
    selectedAddress?.lng,
    pincode
  );

  const productsData = domainData?.stores || []; // Data compatible with ProductResultsWrapper

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
        // Dummy one-item data to satisfy FlatList API
        data={[{ key: "content" }]}
        keyExtractor={(item) => item.key}

        // 🧩 Header components before products
        ListHeaderComponent={
          <View>
            <CategoryHeader onSearchPress={handleSearchPress} />
            <OffersCarousel storesData={productsData} activeColor="#E11D48" />
            <SubCategoriesSection
              categoryData={groceriesCategoryData}
              domain={DOMAINS.GROCERY}
              sectionTitle="Explore by Categories"
              searchCategory="grocery"
            />
          </View>
        }

        // 🛍️ Render products list as content
        renderItem={() => (
          <ProductsSection
            initialProductsData={productsData}
            category="Stores near You"
            domain={DOMAINS.GROCERY}
            selectedAddress={selectedAddress}
          />
        )}

        // FlatList configs
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

export default Grocery;
