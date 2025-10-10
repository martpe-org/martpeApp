import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import { foodCategoryData } from "../../../../constants/categories";
import { DOMAINS, useDomainData } from "@/utility/categoryUtils";
import { styles } from "@/components/Categories/cat";
import {
  CategoryHeader,
  createRefreshControl,
  OffersCarousel,
  SubCategoriesSection,
} from "@/components/Categories/CategoryComponents";
import RestCards from "@/components/Categories/RestCards";

function Food() {
  const selectedAddress = useDeliveryStore((state) => state.selectedDetails);
  const pincode = selectedAddress?.pincode || selectedAddress || "110001";

  const {
    data: domainData,
    isLoading,
    refetch,
  } = useDomainData(
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
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={createRefreshControl(isLoading, refetch, "#f2663c")}
      >
        {/* 🔍 Search Header */}
        <CategoryHeader onSearchPress={handleSearchPress} />

        {/* 🏷️ Offers Carousel */}
        <OffersCarousel storesData={storesData} activeColor="#f2663c" />

        {/* 🍔 Subcategories */}
        <SubCategoriesSection
          categoryData={foodCategoryData}
          domain={DOMAINS.FOOD}
          sectionTitle="Shop by Categories"
          searchCategory="food"
          useLinearGradient={true}
          gradientColors={["#f5f3ee", "rgba(231, 223, 201, 0)"]}
        />

        {/* 🍱 Restaurants List using RestCards */}
        <View style={{ marginTop: 10 }}>
          {storesData.length > 0 ? (
            storesData.map((store: any, index: number) => (
              <RestCards
                key={store.id || index}
                storeData={store}
                userLocation={{
                  lat: selectedAddress?.lat || 0,
                  lng: selectedAddress?.lng || 0,
                }}
              />
            ))
          ) : (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Loader/>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Food;
