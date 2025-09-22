import { Feather, Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { router, useGlobalSearchParams } from "expo-router";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";

// Import search functions and types
import { SafeAreaView } from "react-native-safe-area-context";
import { searchProducts } from "../../../../components/search/search-products";
import { ProductSearchResult } from "../../../../components/search/search-products-type";
import { searchStores } from "../../../../components/search/search-stores";
import { StoreSearchResult } from "../../../../components/search/search-stores-type";
import { styles } from "./searchStyle";
import ProductCard from "@/components/search/ProductCard";
import StoreCard from "@/components/search/StoreCard";


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

// Helper function to group products by store
const groupByStoreId = (catalogs: ProductSearchResult[]) => {
  return catalogs?.reduce((acc, product) => {
    const storeId = product.store_id;
    if (!acc[storeId]) acc[storeId] = [];
    acc[storeId].push(product);
    return acc;
  }, {} as Record<string, ProductSearchResult[]>);
};

const Results: FC = () => {
  const [isItem, setIsItem] = useState(true);
  const { search, domainData } = useGlobalSearchParams<{
    search: string;
    domainData: string;
  }>();

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

  // Products query
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["searchProducts", searchInput],
    queryFn: () => searchProducts(searchInput),
    enabled:
      !!search && !!selectedDetails?.lat && !!selectedDetails?.lng && isItem,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Stores query
  const {
    data: storesData,
    isLoading: isLoadingStores,
    error: storesError,
    refetch: refetchStores,
  } = useQuery({
    queryKey: ["searchStores", searchInput],
    queryFn: () => searchStores(searchInput),
    enabled:
      !!search && !!selectedDetails?.lat && !!selectedDetails?.lng && !isItem,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process data
  const allProducts = productsData?.results || [];
  const allStores = storesData?.results || [];

  // Group products by store
  const productsByStore = useMemo(
    () => groupByStoreId(allProducts),
    [allProducts]
  );
  const storeEntries = useMemo(
    () => Object.entries(productsByStore),
    [productsByStore]
  );

  // Handle tab change
  const handleTabChange = useCallback((itemTab: boolean) => {
    setIsItem(itemTab);
  }, []);

  const currentIsLoading = isItem ? isLoadingProducts : isLoadingStores;
  const currentError = isItem ? productsError : storesError;
  const currentData = isItem ? storeEntries : allStores;

  if (currentIsLoading) return <Loader />;

  if (currentError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {currentError.message || "Failed to load search results"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => (isItem ? refetchProducts() : refetchStores())}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              pathname: "/search",
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

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, isItem && styles.activeTab]}
            onPress={() => handleTabChange(true)}
          >
            <Text style={[styles.tabText, isItem && styles.activeTabText]}>
              ITEMS ({allProducts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isItem && styles.activeTab]}
            onPress={() => handleTabChange(false)}
          >
            <Text style={[styles.tabText, !isItem && styles.activeTabText]}>
              Outlets ({allStores.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={currentData as StoreSearchResult}
        keyExtractor={(item, index) => {
          if (isItem) {
            // For products: item is [storeId, products[]]
            return (item as [string, ProductSearchResult[]])[0];
          } else {
            // For stores: item is StoreSearchResult with string slug
            const store = item as StoreSearchResult;
            return store.slug || `store-${index}`;
          }
        }}
        renderItem={({ item }) =>
          isItem ? (
            <ProductCard item={item as ProductSearchResult[]} />
          ) : (
            <StoreCard item={item as StoreSearchResult} />
          )
        }
        ListHeaderComponent={() => (
          <Text style={styles.resultsTitle}>Showing Results for {search}</Text>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noResultsText}>
            No {isItem ? "items" : "stores"} found
          </Text>
        )}
        contentContainerStyle={styles.contentContainer}
      />

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