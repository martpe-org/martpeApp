import { Feather, Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { router, useGlobalSearchParams } from "expo-router";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";

import { SafeAreaView } from "react-native-safe-area-context";

import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../../../../components/search/search-products";
import { searchStores } from "../../../../components/search/search-stores";
import { styles } from "@/components/search-comp/searchStyle";
import ProductResultsWrapper from "@/components/search-comp/ProductResultsWrapper";
import StoreResultsWrapper from "@/components/search-comp/StoreResultsWrapper";

interface SearchInput {
  lat: number;
  lon: number;
  pincode: string;
  query: string;
  domain: string;
}

interface FoodDetailsState {
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

const Results: FC = () => {
  const { search, domainData, tab } = useGlobalSearchParams<{
    search: string;
    domainData: string;
    tab?: string;
  }>();

  const [isItem, setIsItem] = useState(tab !== "stores");

  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);

  const [foodDetails] = useState<FoodDetailsState>({
    images: "",
    long_desc: "",
    name: "",
    short_desc: "",
    symbol: "",
    price: "",
    storeId: "",
    maxQuantity: 0,
    itemId: "",
    visible: false,
    maxPrice: 0,
    discount: 0,
  });

  const snapPoints = useMemo(() => ["50%", "70%"], []);
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

  // Search input for queries
  const searchInput = useMemo<SearchInput>(
    () => ({
      lat: selectedDetails?.lat || 0,
      lon: selectedDetails?.lng || 0,
      pincode: selectedDetails?.pincode || "110001",
      query: search || "",
      domain: domainData || "",
    }),
    [selectedDetails, search, domainData]
  );

  const pageSize = 10;


  const {
    data: initialProductsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["searchProductsInitial", searchInput],
    queryFn: () =>
      searchProducts({
        ...searchInput,
        groupbystore: true,
        size: pageSize,
      }),
    enabled: !!search && !!selectedDetails?.lat && !!selectedDetails?.lng,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    keepPreviousData: true,   // 👈 prevent clearing when remounting
  });


  const {
    data: initialStoresData,
    isLoading: isLoadingStores,
    error: storesError,
  } = useQuery({
    queryKey: ["searchStoresInitial", searchInput],
    queryFn: () =>
      searchStores({
        ...searchInput,
        size: pageSize,
      }),
    enabled: !!search && !!selectedDetails?.lat && !!selectedDetails?.lng,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    keepPreviousData: true,       // ✅ don’t clear results while refetching
    refetchOnWindowFocus: false,  // ✅ don’t reset on focus
    refetchOnMount: false,        // ✅ don’t reset on remount
  });


  // Handle tab change
  const handleTabChange = useCallback((itemTab: boolean) => {
    setIsItem(itemTab);
    // Update URL param so navigation remembers it
    router.setParams({ tab: itemTab ? "items" : "stores" });
  }, []);


  const currentIsLoading = isItem ? isLoadingProducts : isLoadingStores;
  const currentError = isItem ? productsError : storesError;

  if (currentIsLoading) return <Loader />;

  if (currentError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {currentError.message || "Failed to load search results"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const totalItems =
    initialProductsData?.buckets?.reduce(
      (sum, bucket) => sum + (bucket?.doc_count || 0),
      0
    ) || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back-outline" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/search/search",
              params: { domain: domainData },
            })
          }
          style={styles.searchBar}
        >
          <TextInput
            value={search}
            placeholder="Search for items..."
            style={styles.searchInput}
            editable={false}
          />
          <Feather name="search" size={20} color="#888" />
        </TouchableOpacity>

        <Text style={styles.resultsTitle}>Showing Results for {search}</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, isItem && styles.activeTab]}
            onPress={() => handleTabChange(true)}
          >
            <Text style={[styles.tabText, isItem && styles.activeTabText]}>
              ITEMS ({totalItems})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, !isItem && styles.activeTab]}
            onPress={() => handleTabChange(false)}
          >
            <Text style={[styles.tabText, !isItem && styles.activeTabText]}>
              {domainData === "ONDC:RET11" ? "Restaurants" : "Stores"} ({initialStoresData?.total || 0})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {isItem ? (
          <ProductResultsWrapper
            initialData={initialProductsData?.buckets || []}
            pageSize={pageSize}
            searchParams={{
              query: search || "",
              lat: searchInput.lat,
              lon: searchInput.lon,
              pincode: searchInput.pincode,
              domain: searchInput.domain,
            }}
          />

        ) : (
          <StoreResultsWrapper
            initialData={initialStoresData?.results || []}
            total={initialStoresData?.total || 0}
            pageSize={pageSize}
            searchParams={{
              query: search || "",
              lat: searchInput.lat,
              lon: searchInput.lon,
              pincode: searchInput.pincode,
              domain: searchInput.domain,
            }}
          />
        )}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        backdropComponent={renderBackdrop}
      >
        {foodDetails?.visible && (
          <FoodDetailsComponent foodDetails={foodDetails} />
        )}
      </BottomSheet>
    </SafeAreaView>
  );
};

export default Results;