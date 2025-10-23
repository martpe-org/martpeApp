import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PLPBanner from "../../../../../components/Product-Listing-Page/FoodAndBeverages/PLPBanner";
import Searchbox from "../../../../../components/Product-Listing-Page/FoodAndBeverages/Searchbox";
import FoodDetailsComponent from "../../../../../components/ProductDetails/FoodDetails";
import Loader from "../../../../../components/common/Loader";
import { useVendorData } from "@/state/useVendorData";
import { computeVendorInfo, renderProductListingByDomain } from "@/components/homebydomain/renderProductListingByDomain";
import { styles } from "./PlpStyles";
import useDeliveryStore from "@/components/address/deliveryAddressStore";

// Helper functions
const getFirst = (maybeArr: string | string[] | undefined): string =>
  Array.isArray(maybeArr) ? maybeArr[0] : maybeArr ?? "";

interface FoodDetails {
  images: string;
  long_desc: string;
  name: string;
  short_desc: string;
  symbol: string;
  price: string;
  storeId: string;
  maxQuantity: number;
  itemId: string;
  visible: boolean;
  maxPrice: number;
  discount: number;
}

const PLP: React.FC = () => {
  const vendor = useLocalSearchParams();
  const vendorSlug = getFirst(vendor.id);
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);

  // State
  const [searchString, setSearchString] = useState<string>("");
  const [foodDetails] = useState<FoodDetails>({
    images: "",
    long_desc: "",
    name: "",
    short_desc: "",
    symbol: "",
    price: "",
    storeId: "",
    maxQuantity: 0,
    itemId: "",
    visible: true,
    maxPrice: 0,
    discount: 0,
  });

  // Custom hook for vendor data
  const {
    data: vendorData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useVendorData(vendorSlug);

  // ✅ Extract user location from delivery store
  const userLocation = useMemo(() => {
    // selectedDetails has lat and lng directly at root level
    if (selectedDetails?.lat && selectedDetails?.lng) {
      console.log('✅ User location found:', { lat: selectedDetails.lat, lng: selectedDetails.lng });
      return {
        lat: selectedDetails.lat,
        lng: selectedDetails.lng
      };
    }
    // Debug log if no location found
    console.log('⚠️ No user location found in selectedDetails:', selectedDetails);
    return undefined;
  }, [selectedDetails]);

  // BottomSheet setup
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  // Event handlers
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const onInputChanged = useCallback((text: string) => {
    setSearchString(text);
  }, []);

  // Computed values
  const { vendorAddress, storeCategories, dropdownHeaders } = useMemo(() => {
    if (!vendorData) {
      return {
        vendorAddress: "",
        storeCategories: "",
        dropdownHeaders: [] as string[],
      };
    }
    return computeVendorInfo(vendorData, vendorData.catalogs);
  }, [vendorData]);

  // Simple data flattening
  const allItems = useMemo(() => {
    return vendorData?.catalogs || [];
  }, [vendorData]);

  // Render error component
  const renderError = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.errorContainer}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Error state
  if (isError) {
    return renderError();
  }

  // No data state
  if (!vendorData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Store information unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main render - Always show data regardless of serviceability
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[1]}
        renderItem={() => (
          <View>
            <Searchbox
              search={onInputChanged}
              placeHolder={vendorData.descriptor?.name || "Store"}
              catalog={vendorData.catalogs || []}
            />
            <PLPBanner
              address={vendorAddress}
              descriptor={vendorData.descriptor}
              storeSections={storeCategories}
              geoLocation={vendorData.geoLocation}
              userLocation={userLocation} // ✅ Pass user location
              userAddress={selectedDetails?.fullAddress ?? ""}
              vendorId={vendorSlug}
            />

            {/* Render product listing directly */}
            {renderProductListingByDomain({
              vendorData,
              allItems,
              dropdownHeaders,
              searchString,
              vendorSlug,
            })}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={["#030303"]}
            tintColor="#030303"
          />
        }
        keyExtractor={() => "plp-content"}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={renderBackdrop}
      >
        {foodDetails?.visible && (
          <FoodDetailsComponent foodDetails={foodDetails} />
        )}
      </BottomSheet>
    </SafeAreaView>
  );
};
export default PLP;