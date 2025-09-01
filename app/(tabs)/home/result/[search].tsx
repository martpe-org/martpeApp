import { Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router, useGlobalSearchParams } from "expo-router";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ImageComp from "../../../../components/common/ImageComp";
import Loader from "../../../../components/common/Loader";
import AddToCart from "../../../../components/ProductDetails/AddToCart";
import CustomizationGroup from "../../../../components/ProductDetails/CustomizationGroup";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import { Colors } from "../../../../theme";

// Import search functions and types
import { searchProducts } from "../../../search/search-products";
import { ProductSearchResult } from "../../../search/search-products-type";
import { searchStores } from "../../../search/search-stores";
import { StoreSearchResult } from "../../../search/search-stores-type";

const { width } = Dimensions.get("window");

// Types
interface SearchInput {
  lat: number;
  lon: number;
  pincode: string;
  query: string;
  domain: string;
  page: number;
  size: number;
}

interface SearchResponse {
  results: ProductSearchResult[] | StoreSearchResult[];
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
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

interface CustomizableGroupState {
  customizable: boolean;
  vendorId: string;
  customGroup: any[];
  itemId: string;
  maxLimit: number;
  price: number;
}

// Constants
const PAGE_SIZE = 20;

// Helper functions
const groupByStoreId = (catalogs: ProductSearchResult[]) => {
  return catalogs?.reduce((acc, product) => {
    const storeId = product.store_id;
    if (!acc[storeId]) acc[storeId] = [];
    acc[storeId].push(product);
    return acc;
  }, {} as Record<string, ProductSearchResult[]>);
};

const getDomainName = (domain: string): string => {
  const domainMap: Record<string, string> = {
    "ONDC:RET10": "Grocery",
    "ONDC:RET11": "F&B",
    "ONDC:RET12": "Fashion",
    "ONDC:RET13": "BPC",
    "ONDC:RET14": "Electronics",
    "ONDC:RET16": "Home & Decor",
  };
  return domainMap[domain] || domain;
};

// Search API functions
const fetchProducts = async ({
  pageParam = 1,
  queryKey,
}): Promise<SearchResponse> => {
  const [, searchInput] = queryKey;
  const response = await searchProducts({
    ...searchInput,
    page: pageParam,
    size: PAGE_SIZE,
  });

  return {
    results: response?.results || [],
    totalPages: Math.ceil((response?.total || 0) / PAGE_SIZE),
    currentPage: pageParam,
    hasMore: pageParam < Math.ceil((response?.total || 0) / PAGE_SIZE),
  };
};

const fetchStores = async ({
  pageParam = 1,
  queryKey,
}): Promise<SearchResponse> => {
  const [, searchInput] = queryKey;
  const response = await searchStores({
    ...searchInput,
    page: pageParam,
    size: PAGE_SIZE,
  });

  return {
    results: response?.results || [],
    totalPages: Math.ceil((response?.total || 0) / PAGE_SIZE),
    currentPage: pageParam,
    hasMore: pageParam < Math.ceil((response?.total || 0) / PAGE_SIZE),
  };
};

// Simple components
const VegIndicator: FC = () => (
  <View style={styles.vegIndicator}>
    <Text style={[styles.vegDot, { color: "#4CAF50" }]}>●</Text>
  </View>
);

const LoadingFooter: FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" color="#FB3E44" />
      <Text style={styles.loadingText}>Loading more...</Text>
    </View>
  );
};

const Results: FC = () => {
  const [isItem, setIsItem] = useState(true);
  const { search, domainData } = useGlobalSearchParams<{
    search: string;
    domainData: string;
  }>();

  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);

  const [foodDetails, setFoodDetails] = useState<FoodDetailsState>({
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

  const [customizableGroup, setCustomizableGroup] =
    useState<CustomizableGroupState>({
      customizable: false,
      vendorId: "",
      customGroup: [],
      itemId: "",
      maxLimit: 0,
      price: 0,
    });

  const snapPoints = useMemo(() => ["50%", "70%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleClosePress = useCallback(
    () => bottomSheetRef.current?.close(),
    []
  );
  const handleOpenPress = useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );

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
      page: 1,
      size: PAGE_SIZE,
    }),
    [selectedDetails, search, domainData]
  );

  // Products infinite query
  const {
    data: productsData,
    fetchNextPage: fetchNextProducts,
    hasNextPage: hasNextProducts,
    isFetchingNextPage: isFetchingNextProducts,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useInfiniteQuery({
    queryKey: ["searchProducts", searchInput],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    enabled:
      !!search && !!selectedDetails?.lat && !!selectedDetails?.lng && isItem,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Stores infinite query
  const {
    data: storesData,
    fetchNextPage: fetchNextStores,
    hasNextPage: hasNextStores,
    isFetchingNextPage: isFetchingNextStores,
    isLoading: isLoadingStores,
    error: storesError,
    refetch: refetchStores,
  } = useInfiniteQuery({
    queryKey: ["searchStores", searchInput],
    queryFn: fetchStores,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    enabled:
      !!search && !!selectedDetails?.lat && !!selectedDetails?.lng && !isItem,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Flatten data
  const allProducts = useMemo(
    () =>
      productsData?.pages.flatMap(
        (page) => page.results as ProductSearchResult[]
      ) || [],
    [productsData]
  );

  const allStores = useMemo(
    () =>
      storesData?.pages.flatMap(
        (page) => page.results as StoreSearchResult[]
      ) || [],
    [storesData]
  );

  // Group products by store
  const productsByStore = useMemo(
    () => groupByStoreId(allProducts),
    [allProducts]
  );
  const storeEntries = useMemo(
    () => Object.entries(productsByStore),
    [productsByStore]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (isItem) {
      if (hasNextProducts && !isFetchingNextProducts) {
        fetchNextProducts();
      }
    } else {
      if (hasNextStores && !isFetchingNextStores) {
        fetchNextStores();
      }
    }
  }, [
    isItem,
    hasNextProducts,
    isFetchingNextProducts,
    hasNextStores,
    isFetchingNextStores,
    fetchNextProducts,
    fetchNextStores,
  ]);

  // Handle tab change
  const handleTabChange = useCallback((itemTab: boolean) => {
    setIsItem(itemTab);
  }, []);

  // Handle food details
  const handleFoodDetails = useCallback(
    (product: ProductSearchResult) => {
      setFoodDetails({
        images: product.images?.[0] || "",
        long_desc: product.short_desc || "",
        name: product.name,
        short_desc: product.short_desc || "",
        symbol: product.symbol,
        price: product.price.value.toString(),
        storeId: product.store_id,
        itemId: product.symbol,
        discount: product.price.offerPercent || 0,
        maxPrice: product.price.maximum_value || 0,
        visible: true,
        maxQuantity: product.quantity || 1,
      });
      handleOpenPress();
    },
    [handleOpenPress]
  );

  // Handle customizable group
  const handleCustomizableGroup = useCallback(
    (product: ProductSearchResult) => {
      setCustomizableGroup({
        customizable: true,
        vendorId: product.store_id,
        customGroup: product.directlyLinkedCustomGroupIds || [],
        itemId: product.symbol,
        maxLimit: product.quantity || 1,
        price: product.price.value,
      });
      handleOpenPress();
    },
    [handleOpenPress]
  );

  // Product Card Component
  const ProductCard: FC<{
    item: [string, ProductSearchResult[]];
  }> = ({ item: [storeId, products] }) => {
    const firstProduct = products[0];
    if (!firstProduct?.store) return null;

    const store = firstProduct.store;
    const domainName = getDomainName(firstProduct.domain);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.storeInfo}
            onPress={() =>
              router.push(`/(tabs)/home/result/productListing/${store.slug}`)
            }
          >
            <ImageComp
              source={{ uri: store.symbol || "https://via.placeholder.com/60" }}
              imageStyle={styles.storeImage}
              resizeMode="cover"
            />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
              <Text style={styles.storeMetrics}>
                ★ {store.rating || "4.2"} •{" "}
                {Math.round((firstProduct.tts_in_h || 1) * 60)}min •{" "}
                {firstProduct.distance_in_km.toFixed(1)}km
              </Text>
              {(firstProduct.price.offerPercent || 0) > 0 && (
                <Text style={styles.offerText}>
                  Up to {Math.ceil(firstProduct.price.offerPercent || 0)}% Off
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(product, index) => `${product.slug}-${index}`}
          contentContainerStyle={styles.productsContainer}
          renderItem={({ item: product }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() =>
                router.push(
                  `/(tabs)/home/result/productDetails/${product.slug}`
                )
              }
            >
              <ImageComp
                source={{
                  uri: product.symbol || "https://via.placeholder.com/120",
                }}
                imageStyle={styles.productImage}
                resizeMode="cover"
              />

              <View style={styles.productInfo}>
                {domainName === "F&B" && <VegIndicator />}
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{product.price.value}</Text>
                  {product.price.offerPercent && (
                    <Text style={styles.originalPrice}>
                      ₹{product.price.maximum_value}
                    </Text>
                  )}
                </View>

                <View style={styles.actionRow}>
                  {product.customizable ? (
                    <TouchableOpacity
                      onPress={() => handleCustomizableGroup(product)}
                      style={styles.addButton}
                    >
                      <Text style={styles.addButtonText}>ADD</Text>
                    </TouchableOpacity>
                  ) : (
                    <AddToCart
                      storeId={product.store_id}
                      slug={product.slug}
                      catalogId={product.catalog_id}
                      price={product.price?.value || 0}
                    />
                  )}

                  {domainName === "F&B" && (
                    <TouchableOpacity
                      onPress={() => handleFoodDetails(product)}
                      style={styles.infoButton}
                    >
                      <Text style={styles.infoButtonText}>Info</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Store Card Component
  const StoreCard: FC<{ item: StoreSearchResult }> = ({ item: store }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(tabs)/home/result/productListing/${store.slug}`)
      }
      style={styles.storeCard}
    >
      <ImageComp
        source={{
          uri: store.symbol || "https://via.placeholder.com/60",
        }}
        imageStyle={styles.storeCardImage}
        resizeMode="cover"
      />
      <View style={styles.storeCardInfo}>
        <Text style={styles.storeCardName}>{store.name}</Text>
        <Text style={styles.storeCardDetails}>
          ★ {store.rating || "4.2"} • {store.distance_in_km.toFixed(1)}km
        </Text>
        <Text style={styles.storeCardAddress} numberOfLines={1}>
          {store.address.city}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const currentIsLoading = isItem ? isLoadingProducts : isLoadingStores;
  const currentError = isItem ? productsError : storesError;
  const currentData = isItem ? storeEntries : allStores;
  const currentIsFetchingNext = isItem
    ? isFetchingNextProducts
    : isFetchingNextStores;

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "./search",
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
              Restaurents ({allStores.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={currentData}
        keyExtractor={
          isItem
            ? (item) => (item as [string, ProductSearchResult[]])[0]
            : (item) => (item as StoreSearchResult).slug
        }
        renderItem={({ item }) =>
          isItem ? (
            <ProductCard item={item as [string, ProductSearchResult[]]} />
          ) : (
            <StoreCard item={item as StoreSearchResult} />
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <Text style={styles.resultsTitle}>
            Showing Results for {search}
          </Text>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noResultsText}>
            No {isItem ? "items" : "stores"} found
          </Text>
        )}
        ListFooterComponent={() => (
          <LoadingFooter isLoading={currentIsFetchingNext} />
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

        {customizableGroup.customizable && (
          <CustomizationGroup
            customGroup={customizableGroup.customGroup}
            customizable={customizableGroup.customizable}
            vendorId={customizableGroup.vendorId}
            itemId={customizableGroup.itemId}
            maxLimit={customizableGroup.maxLimit}
            price={customizableGroup.price}
            closeFilter={handleClosePress}
            providerId=""
            domain=""
            cityCode=""
            bppId=""
          />
        )}
      </BottomSheet>
    </View>
  );
};

export default Results;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE_COLOR,
    flex: 1,
  },
  header: {
    backgroundColor: Colors.WHITE_COLOR,
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 5,
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 20,
  },
  activeTab: {
    borderWidth: 2,
    backgroundColor: "#FB3E44",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1f0404",
  },
  activeTabText: {
    color: "#ecdedf",
  },
  contentContainer: {
    flexGrow: 1,
  },
  resultsTitle: {
    fontSize: 14,
    color: "#666",
    margin: 16,
    textTransform: "capitalize",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: "#FB3E44",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 9,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  storeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeMetrics: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  offerText: {
    fontSize: 12,
    color: "#0d470f",
    fontWeight: "500",
  },
  productsContainer: {
    paddingLeft: 4,
  },
  productCard: {
    width: width * 0.6,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  productImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productInfo: {
    padding: 12,
  },
  vegIndicator: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  vegDot: {
    color: "#4CAF50",
    fontSize: 16,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoButton: {
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  infoButtonText: {
    fontSize: 11,
    color: "#666",
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storeCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  storeCardInfo: {
    flex: 1,
  },
  storeCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeCardDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  storeCardAddress: {
    fontSize: 12,
    color: "#888",
  },
});
