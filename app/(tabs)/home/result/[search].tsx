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
import AddToCart from "../../../../components/common/AddToCart";
import ImageComp from "../../../../components/common/ImageComp";
import Loader from "../../../../components/common/Loader";
import LikeButton from "../../../../components/common/likeButton";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";

// Import search functions and types
import { SafeAreaView } from "react-native-safe-area-context";
import { searchProducts } from "../../../search/search-products";
import { ProductSearchResult } from "../../../search/search-products-type";
import { searchStores } from "../../../search/search-stores";
import { StoreSearchResult } from "../../../search/search-stores-type";
import { styles } from "./searchStyle";

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

// Simple components
const VegIndicator: FC = () => (
  <View style={styles.vegIndicator}>
    <Text style={[styles.vegDot, { color: "#4CAF50" }]}>●</Text>
  </View>
);

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
                <Text>
                  {Math.round((firstProduct.tts_in_h || 1) * 60)}min • {" "}
                </Text>
                <Text>{firstProduct.distance_in_km.toFixed(1)}km</Text>
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
          renderItem={({ item: product }) => {
            const productId = Array.isArray(product.slug) ? product.slug[0] : product.slug;
            const discountPercent = product.price.offerPercent || 0;
            
            return (
              <View
                style={styles.productCard}
              >
                {/* Product Image with overlays */}
                <View style={{ position: 'relative' }}>
                  <ImageComp
                    source={{
                      uri: product.symbol || "https://via.placeholder.com/120",
                    }}
                    imageStyle={styles.productImage}
                    resizeMode="cover"
                  />
                  
                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <View style={styles.productDiscountBadge}>
                      <Text style={styles.productDiscountText}>
                        {Math.ceil(discountPercent)}% OFF
                      </Text>
                    </View>
                  )}
                  
                  {/* Like Button */}
                  <View style={styles.likeButtonContainer}>
                    <LikeButton productId={productId} color="#E11D48" />
                  </View>
                </View>

                <TouchableOpacity style={styles.productInfo}
                                onPress={() =>
                  router.push(
                    `/(tabs)/home/result/productDetails/${product.slug}`
                  )
                }
                >
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
                    <AddToCart
                      storeId={product.store_id}
                      slug={product.slug}
                      catalogId={product.catalog_id}
                      price={product.price?.value || 0}
                      productName={product.name}
                      customizable={product.customizable}
                      directlyLinkedCustomGroupIds={
                        product.directlyLinkedCustomGroupIds || []
                      }
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    );
  };

  // Store Card Component
  const StoreCard: FC<{ item: StoreSearchResult }> = ({ item: store }) => {
    const storeId = Array.isArray(store.slug) ? store.slug[0] : store.slug;
    
    return (
      <View style={styles.storeCardWrapper}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={styles.storeCardName} numberOfLines={1}>
                {store.name}
              </Text>
            </View>
            <Text style={styles.storeCardDetails}>
              <Text>{store.distance_in_km.toFixed(1)}km</Text>
            </Text>
            <Text style={styles.storeCardAddress} numberOfLines={1}>
              {store.address.city}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

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
              Restaurants ({allStores.length})
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