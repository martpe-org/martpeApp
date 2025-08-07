import React, { FC, useEffect, useState, useRef } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
  Pressable,
} from "react-native";
import { useGlobalSearchParams, router } from "expo-router";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from "react-native-svg";
import Feather from "react-native-vector-icons/Feather";
import { getDistance } from "geolib";
import Constants from "expo-constants";

import { Colors } from "../../../../theme";
import ImageComp from "../../../../components/common/ImageComp";
import Loader from "../../../../components/common/Loader";
import AddToCartButton from "../../../../components/search/AddToCartButton";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import CustomizationGroup from "../../../../components/ProductDetails/CustomizationGroup";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";
import FilterCard from "../../../../components/search/filterCard";
import { useHideTabBarStore } from "../../../../state/hideTabBar";
import {
  filters,
  offerData,
  deliveryData,
} from "../../../../constants/filters";

// Import the search functions
import { searchProducts } from "../../../search/search-products";
import { searchStores } from "../../../search/search-stores";
import { SearchProductsResponseType, ProductSearchResult } from "../../../search/search-products-type";
import { SearchStoresResponseType, StoreSearchResult } from "../../../search/search-stores-type";

const windowWidth = Dimensions.get("window").width;
const { width } = Dimensions.get("window");
const snapInterval = width * 0.72;
const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

// Updated Types to match the imported types
interface SearchResult {
  catalogs: ProductSearchResult[];
  stores: StoreSearchResult[];
}

// Update CatalogItem to match ProductSearchResult
interface CatalogItem extends ProductSearchResult {
  _id: string;
}

// Update Store to match StoreSearchResult  
interface Store extends StoreSearchResult {
  _id: string;
}

interface GroupedCatalogItems {
  [storeId: string]: CatalogItem[];
}

interface FilterState {
  category: string[];
  offers: number;
  delivery: number;
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

interface SearchProps {
  domain: string;
}

interface ProductCardProps {
  storeName: string;
  products: CatalogItem[];
}

// Helper functions
const groupByStoreId = (catalogs: CatalogItem[]): GroupedCatalogItems => {
  return catalogs?.reduce((acc: GroupedCatalogItems, product: CatalogItem) => {
    const storeId = product.store_id;
    if (!acc[storeId]) {
      acc[storeId] = [];
    }
    acc[storeId].push(product);
    return acc;
  }, {});
};

const getDistances = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const distance = Number(
    (
      getDistance(
        { latitude: lat1, longitude: lon1 },
        { latitude: lat2, longitude: lon2 }
      ) / 1000
    ).toFixed(1)
  );
  return distance;
};

// SVG Components
const CircleSvg = () => {
  return (
    <View style={{ marginHorizontal: 4 }}>
      <Svg width={5} height={5} fill="none">
        <Circle cx={2.5} cy={2.5} r={2.5} fill="#000" />
      </Svg>
    </View>
  );
};

const VegSvg = () => {
  return (
    <Svg width={11} height={11} fill="none">
      <Rect
        width={10}
        height={10}
        x={0.5}
        y={0.5}
        fill="#fff"
        stroke="#1DA578"
        rx={1.5}
      />
      <Circle cx={5.5} cy={5.5} r={2.063} fill="#1DA578" />
    </Svg>
  );
};

const ForwardArrowSvg: FC<{ margin: number }> = ({ margin }) => {
  return (
    <View style={{ marginLeft: margin }}>
      <Svg width={24} height={24} fill="none">
        <Path
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14M12 5l7 7-7 7"
        />
      </Svg>
    </View>
  );
};

const ClockSvg: FC<{ title: number }> = ({ title }) => {
  return (
    <Svg width={56} height={16} fill="none">
      <Path
        fill="url(#a)"
        d="M1.037 8a7 7 0 0 1 7-7H56v14H8.037a7 7 0 0 1-7-7Z"
      />
      <Path
        fill="#5DA058"
        fillRule="evenodd"
        d="M13.333 8A5.333 5.333 0 1 1 2.666 8a5.333 5.333 0 0 1 10.667 0ZM8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334ZM8.333 4v3.774l3.124 1.25-.248.619L7.876 8.31l-.21-.084V4h.667Z"
        clipRule="evenodd"
      />
      <Defs>
        <LinearGradient
          id="a"
          x1={1.037}
          x2={67.627}
          y1={8}
          y2={8}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CDF8A2" />
          <Stop offset={1} stopColor="#D9D9D9" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Text
        style={{
          color: "#666464",
          textAlign: "center",
          flexDirection: "row",
          alignItems: "center",
          fontSize: 12,
          marginLeft: 12,
          paddingLeft: 4,
        }}
      >
        {Math.round(title * 60)} min
      </Text>
    </Svg>
  );
};

const Results: FC<SearchProps> = () => {
  const [isItem, setIsItem] = useState(true);
  const { search, domainData } = useGlobalSearchParams<{
    search: string;
    domainData: string;
  }>();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult>({
    catalogs: [],
    stores: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setHideTabBar = useHideTabBarStore((state) => state.setHideTabBar);
  const [filterSelected, setFilterSelected] = useState<FilterState>({
    category: [],
    offers: 0,
    delivery: 100,
  });
  const [activeFilter, setActiveFilter] = useState<string>("");
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

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );
  const [CustomizableGroup, setCustomizableGroup] =
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

  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenPress = () => bottomSheetRef.current?.expand();

  // Updated fetchSearchResults function
  const fetchSearchResults = async () => {
    if (!search || !selectedDetails?.lat || !selectedDetails?.lng) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert selectedDetails.lng to selectedDetails.lon to match API expectations
      const searchInput = {
        lat: selectedDetails.lat,
        lon: selectedDetails.lng, // Note: API expects 'lon' but store has 'lng'
        pincode: selectedDetails.pincode || "110001", // Provide default pincode if not available
        query: search,
        domain: domainData,
        page: 1,
        size: 50,
      };

      // Fetch both products and stores concurrently
      const [productsResponse, storesResponse] = await Promise.all([
        searchProducts(searchInput),
        searchStores(searchInput),
      ]);

      // Handle the responses
      const catalogsData = productsResponse?.results || [];
      const storesData = storesResponse?.results || [];

      // Map the results to match existing interface expectations
      const mappedCatalogs: CatalogItem[] = catalogsData.map((item) => ({
        ...item,
        _id: item.symbol, // Map symbol to _id for compatibility
        custom_group: item.directlyLinkedCustomGroupIds || [],
      }));

      const mappedStores: Store[] = storesData.map((store) => ({
        ...store,
        _id: store.symbol, // Map symbol to _id for compatibility
      }));

      setSearchResults({
        catalogs: mappedCatalogs,
        stores: mappedStores,
      });

      // Check if we should show stores tab
      if (mappedCatalogs.length === 0 && mappedStores.length > 0) {
        setIsItem(false);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to load search results");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [search, domainData, selectedDetails]);

  const catalogsData = searchResults.catalogs;
  const storesData = searchResults.stores;

  const CategoryAvailable = Array.from(
    new Set(catalogsData?.map((item: CatalogItem) => item.category_id))
  ).map((category: string, index: number) => ({
    id: index + 1,
    label: category,
    value: category,
  }));

  const ProductCard: FC<ProductCardProps> = ({ storeName, products }) => {
    const firstProduct = products[0];
    if (!firstProduct?.store) return null;

    const store = firstProduct.store;
    const domainName = getDomainName(firstProduct.domain); // Use domain from product, not store

    const doesProductMatchFilters = (product: CatalogItem): boolean => {
      const isCategoryMatch =
        filterSelected.category.length === 0 ||
        filterSelected.category.includes(product.category_id);

      // For offers, we should check both product-level and potentially store-level offers
      const productOfferPercent = product.price.offerPercent || 0;
      const isOfferMatch = productOfferPercent >= filterSelected.offers;

      // Use tts_in_h from product level
      const isDeliveryMatch = (product.tts_in_h || 0) <= filterSelected.delivery;

      return isCategoryMatch && isOfferMatch && isDeliveryMatch;
    };

    const filteredProducts = products.filter(doesProductMatchFilters);

    if (filteredProducts.length === 0) return null;

    if (domainName === "F&B") {
      return (
        <View style={[styles.card, { marginVertical: 10 }]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.storeImageContainer}>
                <ImageComp
                  source={{
                    uri:
                      store.symbol ||
                      "https://via.placeholder.com/150?text=Store",
                  }}
                  imageStyle={styles.storeImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.providerName}>{store.name}</Text>
                <View style={styles.storeMetrics}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{store.rating || "4.2"}</Text>
                    <MaterialCommunityIcons
                      color="#FFC700"
                      size={16}
                      name="star"
                    />
                  </View>
                  <CircleSvg />
                  <ClockSvg title={firstProduct.tts_in_h || 1} />
                  <CircleSvg />
                  <Text style={styles.domainName}>
                    {firstProduct.distance_in_km.toFixed(1)}km
                  </Text>
                </View>
                {(firstProduct.price.offerPercent || 0) > 0 && (
                  <Text style={styles.offerText}>
                    Upto {Math.ceil(firstProduct.price.offerPercent || 0)}% Off
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                router.push(`../(tabs)/home/productListing/${store.slug}`);
              }}
            >
              <ForwardArrowSvg margin={70} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={snapInterval}
            decelerationRate="fast"
            style={styles.scrollViewStyle}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {filteredProducts.map((product: CatalogItem, index: number) => (
              <View key={index} style={styles.productItemFood}>
                <Pressable style={styles.foodItemContainer}>
                  <View>
                    <View style={styles.productImageContainer}>
                      <ImageComp
                        source={{
                          uri:
                            product.images?.[0] ||
                            "https://via.placeholder.com/150?text=Product",
                        }}
                        imageStyle={styles.productImageFood}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.addButtonArea}>
                      {product.customizable ? (
                        <TouchableOpacity
                          onPress={() => {
                            setCustomizableGroup({
                              customizable: product.customizable || false,
                              vendorId: product.store_id,
                              customGroup: product.custom_group || [],
                              itemId: product.symbol, // Use symbol as itemId
                              maxLimit: product.quantity || 1,
                              price: product.price.value,
                            });
                            setIsFilterVisible(false);
                            setFoodDetails({ ...foodDetails, visible: false });
                            handleOpenPress();
                          }}
                        >
                          <View
                            style={[styles.addButton, { paddingVertical: 6.5 }]}
                          >
                            <Text style={styles.addButtonText}>{"ADD"}</Text>
                          </View>
                          <Text style={styles.customizableText}>
                            Customizable
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <AddToCartButton
                          storeId={product.store_id}
                          itemId={product.symbol}
                          maxQuantity={product.quantity || 1}
                        />
                      )}
                    </View>
                  </View>

                  <View style={styles.productDetails}>
                    <View style={styles.vegIndicator}>
                      <VegSvg />
                      <Text style={styles.bestSellerText}>
                        {product.recommended ? "Best Seller" : ""}
                      </Text>
                    </View>

                    <Text style={styles.productNameFood}>{product.name}</Text>

                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.priceText}>
                        ₹{product.price.value}
                      </Text>
                      {product.price.offerPercent && (
                        <>
                          <Text style={styles.originalPriceText}>
                            ₹{product.price.maximum_value}
                          </Text>
                          <Text style={styles.offerPercentText}>
                            {Math.ceil(product.price.offerPercent)}% Off
                          </Text>
                        </>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.moreInfoButton}
                      onPress={() => {
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
                        setCustomizableGroup({
                          ...CustomizableGroup,
                          customizable: false,
                        });
                        setIsFilterVisible(false);
                      }}
                    >
                      <Text style={styles.moreInfoText}>More Info</Text>
                    </TouchableOpacity>

                    <View style={styles.productRating}>
                      <Text style={styles.ratingText}>{product.rating || "4.2"}</Text>
                      <MaterialCommunityIcons
                        color="#FFC700"
                        size={16}
                        name="star"
                      />
                    </View>
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    // Grocery domain
    if (domainName === "Grocery") {
      return (
        <View style={[styles.card]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.storeImageContainer}>
                <ImageComp
                  source={{
                    uri:
                      store.symbol ||
                      "https://via.placeholder.com/150?text=Store",
                  }}
                  imageStyle={styles.storeImage}
                  resizeMode="cover"
                />
              </View>
              <View style={{ marginLeft: 10 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <Text style={styles.providerName}>{store.name}</Text>
                  <View style={{ alignItems: "center", flexDirection: "row" }}>
                    <CircleSvg />
                    <ClockSvg title={firstProduct.tts_in_h || 1} />
                    <CircleSvg />
                  </View>
                  <Text style={styles.domainName}>
                    {firstProduct.distance_in_km.toFixed(1)}km
                  </Text>
                </View>
                {(firstProduct.price.offerPercent || 0) > 0 && (
                  <Text style={styles.offerText}>
                    Upto {Math.ceil(firstProduct.price.offerPercent || 0)}% Off
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                router.push(`../(tabs)/home/productListing/${store.slug}`);
              }}
            >
              <ForwardArrowSvg margin={30} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={snapInterval}
            decelerationRate="fast"
            style={styles.scrollViewStyle}
          >
            {products.map((product: CatalogItem, index: number) => (
              <Pressable
                onPress={() => {
                  router.push(`../(tabs)/home/productDetails/${product.slug}`);
                }}
                key={index}
                style={styles.productItem}
              >
                <View style={styles.groceryImageContainer}>
                  <ImageComp
                    source={{
                      uri:
                        product.images?.[0] ||
                        "https://via.placeholder.com/150?text=Product",
                    }}
                    imageStyle={styles.groceryImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.addButtonContainer}>
                  <AddToCartButton
                    storeId={product.store_id}
                    itemId={product.symbol}
                  />
                </View>
                <View style={styles.groceryProductDetails}>
                  <Text style={styles.productName}>{product.name}</Text>

                  <View style={styles.unitContainer}>
                    <Text style={styles.unitText}>
                      {product.unitized?.measure?.value}
                    </Text>
                    <Text style={styles.unitText}>
                      {product.unitized?.measure?.unit}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.priceText}>₹{product.price.value}</Text>
                    {product.price.offerPercent && (
                      <>
                        <Text style={styles.originalPriceText}>
                          ₹{product.price.maximum_value}
                        </Text>
                        <Text style={styles.offerPercentText}>
                          {Math.ceil(product.price.offerPercent)}% Off
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      );
    }

    // Other domains (Fashion, Electronics, etc.)
    const otherDomains = ["Fashion", "Electronics", "Home & Decor", "BPC"];
    if (otherDomains.includes(domainName)) {
      return (
        <View style={[styles.card, { marginTop: 10 }]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.storeImageContainer}>
                <ImageComp
                  source={{
                    uri:
                      store.symbol ||
                      "https://via.placeholder.com/150?text=Store",
                  }}
                  imageStyle={styles.storeImage}
                  resizeMode="cover"
                />
              </View>
              <View style={{ marginHorizontal: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.providerName}>{store.name}</Text>
                  <CircleSvg />
                  <ClockSvg title={firstProduct.tts_in_h || 1} />
                  <CircleSvg />
                  <Text style={styles.domainName}>
                    {firstProduct.distance_in_km.toFixed(1)}km
                  </Text>
                </View>
                {(firstProduct.price.offerPercent || 0) > 0 && (
                  <Text style={styles.offerText}>
                    Upto {Math.ceil(firstProduct.price.offerPercent || 0)}% Off
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                router.push(`../(tabs)/home/productListing/${store.slug}`);
              }}
            >
              <ForwardArrowSvg margin={30} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={snapInterval}
            decelerationRate="fast"
            style={styles.scrollViewStyle}
          >
            {products.map((product: CatalogItem, index: number) => (
              <Pressable
                onPress={() => {
                  router.push(`../(tabs)/home/productDetails/${product.slug}`);
                }}
                key={index}
                style={styles.productItem}
              >
                <View style={styles.otherDomainImageContainer}>
                  <ImageComp
                    source={{
                      uri:
                        product.images?.[0] ||
                        "https://via.placeholder.com/150?text=Product",
                    }}
                    imageStyle={styles.otherDomainImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.otherDomainProductDetails}>
                  <Text style={styles.productName}>{product.name}</Text>

                  <View style={{ flexDirection: "row" }}>
                    {product.price.maximum_value &&
                      product.price.maximum_value > product.price.value && (
                        <Text style={styles.originalPriceText}>
                          ₹{Math.ceil(product.price.maximum_value)}
                        </Text>
                      )}
                    <Text style={styles.priceText}>
                      ₹{Math.ceil(product.price.value)}
                    </Text>
                  </View>

                  {product.price.offerPercent && (
                    <Text style={styles.offerPercentBold}>
                      {Math.ceil(product.price.offerPercent)}% off
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      );
    }

    return null;
  };

  // Helper function to get domain name
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

  const productsByStore = groupByStoreId(catalogsData);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red", textAlign: "center", margin: 20 }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Feather
            name="arrow-left"
            style={styles.headerLeftIcon}
            onPress={() => router.back()}
          />
          <Text style={styles.headerTitle}>Search Anything you want</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/search",
              params: { domain: domainData },
            });
          }}
          style={styles.searchContainer}
        >
          <TextInput
            value={search}
            onPressIn={() =>
              router.push({
                pathname: "/search",
                params: { domain: domainData },
              })
            }
            placeholder="Search for dishes, clothing, groceries.."
            style={styles.searchInput}
            selectionColor="#8E8A8A"
            placeholderTextColor="#8E8A8A"
          />
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/search",
                params: { domain: domainData },
              })
            }
            style={styles.searchIcon}
          >
            <Feather name="x" size={20} color="#8E8A8A" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={isItem ? styles.active : styles.inactive}
            onPress={() => setIsItem(true)}
          >
            <Text
              style={!isItem ? styles.inactiveTabText : styles.activeTabText}
            >
              Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={isItem ? styles.inactive : styles.active}
            onPress={() => setIsItem(false)}
          >
            <Text
              style={isItem ? styles.inactiveTabText : styles.activeTabText}
            >
              Outlets
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isItem ? (
        <View>
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView style={styles.filtersScrollView} horizontal>
              {filters.map((filter, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterButton,
                    {
                      borderColor:
                        (filter.name === "Category" &&
                          filterSelected.category.length > 0) ||
                        (filter.name === "Offers" &&
                          filterSelected.offers > 0) ||
                        (filter.name === "Delivery" &&
                          filterSelected.delivery < 100)
                          ? "black"
                          : "#EEEEEE",
                    },
                  ]}
                  onPress={() => {
                    handleOpenPress();
                    setActiveFilter(filter?.name);
                    setFoodDetails({
                      ...foodDetails,
                      visible: false,
                    });
                    setIsFilterVisible(true);
                    setCustomizableGroup({
                      ...CustomizableGroup,
                      customizable: false,
                    });
                  }}
                >
                  <Text style={styles.filterButtonText}>
                    {
                      {
                        Category:
                          "Category " +
                          (filterSelected.category.length > 0
                            ? `(${filterSelected.category.length})`
                            : ""),
                        Offers:
                          filterSelected.offers > 0
                            ? filterSelected.offers + "% and above"
                            : "Offers",
                        Delivery:
                          filterSelected.delivery < 100
                            ? filterSelected.delivery + " min or less"
                            : "Delivery",
                      }[filter?.name]
                    }
                  </Text>

                  <Pressable
                    style={[
                      styles.filterClearButton,
                      {
                        display:
                          (filter.name === "Category" &&
                            filterSelected.category.length > 0) ||
                          (filter.name === "Offers" &&
                            filterSelected.offers > 0) ||
                          (filter.name === "Delivery" &&
                            filterSelected.delivery < 100)
                            ? "flex"
                            : "none",
                      },
                    ]}
                    onPress={() => {
                      setFoodDetails({
                        ...foodDetails,
                        visible: false,
                      });
                      setCustomizableGroup({
                        ...CustomizableGroup,
                        customizable: false,
                      });
                      setFilterSelected({
                        category:
                          filter.name === "Category"
                            ? []
                            : filterSelected.category,
                        offers:
                          filter.name === "Offers" ? 0 : filterSelected.offers,
                        delivery:
                          filter.name === "Delivery"
                            ? 100
                            : filterSelected.delivery,
                      });
                    }}
                  >
                    <Feather name="x" size={16} color="black" />
                  </Pressable>
                </TouchableOpacity>
              ))}

              {(filterSelected.category.length > 0 ||
                filterSelected.delivery !== 100 ||
                filterSelected.offers !== 0) && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setFilterSelected({
                      category: [],
                      offers: 0,
                      delivery: 100,
                    });
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          <View style={styles.resultsContainer}>
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.cardContainer}>
                <Text
                  style={[
                    styles.cardTitle,
                    { textTransform: "capitalize", marginLeft: width * 0.03 },
                  ]}
                >
                  Showing Results for {search}
                </Text>
              </View>

              {catalogsData.length === 0 && (
                <Text
                  style={[
                    styles.cardTitle,
                    { textTransform: "capitalize", marginLeft: width * 0.03 },
                  ]}
                >
                  No Items available to show
                </Text>
              )}

              {Object.entries(productsByStore).map(([storeId, products]) => (
                <ProductCard
                  key={storeId}
                  storeName={products[0]?.store?.name || "Unknown Store"}
                  products={products}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.cardContainer}>
            <Text
              style={[
                styles.cardTitle,
                { textTransform: "capitalize", marginLeft: width * 0.03 },
              ]}
            >
              Showing Results for {search}
            </Text>
          </View>

          {storesData.length === 0 && (
            <Text
              style={[
                styles.cardTitle,
                { textTransform: "capitalize", marginLeft: width * 0.03 },
              ]}
            >
              No Stores available to show
            </Text>
          )}

          <ScrollView contentContainerStyle={styles.content}>
            {storesData.map((store: Store, index: number) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    router.push(`../(tabs)/home/productListing/${store.slug}`);
                  }}
                  key={index}
                  style={styles.storeCard}
                >
                  <View>
                    <ImageComp
                      source={{
                        uri:
                          store.symbol ||
                          "https://via.placeholder.com/150?text=Store",
                      }}
                      imageStyle={styles.storeCardImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.storeCardDetails}>
                    <Text style={styles.storeCardName}>{store.name}</Text>
                    <View style={styles.storeCardMetrics}>
                      <View style={styles.storeCardRating}>
                        <MaterialCommunityIcons
                          name="star"
                          size={18}
                          color="#FFD523"
                        />
                        <Text style={styles.storeCardRatingText}>
                          {store.rating || "4.2"}
                        </Text>
                        {Math.ceil(store.maxStoreItemOfferPercent || 0) > 0 ? (
                          <Text style={styles.storeCardOffer}>
                            Upto {Math.ceil(store.maxStoreItemOfferPercent || 0)}%
                            Off
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={{ flexDirection: "column" }}>
                      <Text style={styles.storeCardAddress}>
                        <MaterialCommunityIcons name="map-marker" />
                        {store.address.street ? `${store.address.street}, ` : ""}
                        {store.address.city}
                      </Text>

                      <Text style={styles.storeCardDelivery}>
                        <MaterialCommunityIcons name="truck" /> 
                        {store.distance_in_km.toFixed(1)}km • {Math.round((store.avg_tts_in_h || 1) * 60)} min
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        backdropComponent={renderBackdrop}
      >
        {isFilterVisible && (
          <FilterCard
            options={filters}
            activeOption={activeFilter}
            categoryData={CategoryAvailable}
            filterSelected={filterSelected}
            offerData={offerData}
            deliveryData={deliveryData}
            setActiveOption={setActiveFilter}
            closeFilter={handleClosePress}
            setFilterSelected={setFilterSelected}
          />
        )}

        {foodDetails?.visible && (
          <FoodDetailsComponent
            closeFilter={handleClosePress}
            foodDetails={foodDetails}
          />
        )}

        {CustomizableGroup.customizable && (
          <CustomizationGroup
            customGroup={CustomizableGroup.customGroup}
            customizable={CustomizableGroup.customizable}
            vendorId={CustomizableGroup.vendorId}
            itemId={CustomizableGroup.itemId}
            maxLimit={CustomizableGroup.maxLimit}
            price={CustomizableGroup.price}
            closeFilter={handleClosePress}
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
  headerContainer: {
    flexDirection: "column",
    paddingVertical: 10,
    backgroundColor: Colors.WHITE_COLOR,
    marginTop:20
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: Dimensions.get("screen").width * 0.03,
  },
  headerLeftIcon: {
    color: Colors.BLACK_COLOR,
    marginRight: 15,
    fontSize: 25,
  },
  headerTitle: {
    color: Colors.BLACK_COLOR,
    textAlign: "center",
    fontSize: 16,
  },
  searchContainer: {
    backgroundColor: Colors.WHITE_COLOR,
    flexDirection: "row",
    borderColor: "#C7C4C4",
    borderWidth: 2,
    alignItems: "center",
    borderRadius: 13,
    marginTop: 10,
    marginHorizontal: Dimensions.get("screen").width * 0.03,
  },
  searchInput: {
    height: 50,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    width: width * 0.6,
    paddingHorizontal: 20,
    paddingLeft: 10,
    color: "#8E8A8A",
    textAlign: "left",
    flex: 1,
  },
  searchIcon: {
    paddingRight: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  active: {
    paddingTop: 10,
    width: "50%",
    borderBottomWidth: 2,
    borderBottomColor: "#F05454",
  },
  inactive: {
    paddingTop: 10,
    width: "50%",
    borderBottomWidth: 2,
    borderBottomColor: "gray",
  },
  activeTabText: {
    textAlign: "center",
    color: "#F05454",
    fontWeight: "500",
  },
  inactiveTabText: {
    textAlign: "center",
    color: "black",
  },
  filtersContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginTop: 10,
  },
  filtersScrollView: {
    flexDirection: "row",
    marginVertical: Dimensions.get("screen").width * 0.02,
    position: "relative",
    marginHorizontal: Dimensions.get("screen").width * 0.03,
  },
  filterButton: {
    borderWidth: 1,
    backgroundColor: "white",
    borderRadius: 100,
    paddingHorizontal: Dimensions.get("screen").width * 0.03,
    paddingVertical: Dimensions.get("screen").width * 0.015,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Dimensions.get("screen").width * 0.01,
    flexDirection: "row",
  },
  filterButtonText: {
    color: "black",
    fontWeight: "600",
  },
  filterClearButton: {
    marginLeft: 5,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: "#F13A3A",
    backgroundColor: "white",
    borderRadius: 100,
    paddingHorizontal: Dimensions.get("screen").width * 0.03,
    paddingVertical: Dimensions.get("screen").width * 0.01,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Dimensions.get("screen").width * 0.03,
  },
  resetButtonText: {
    color: "#F13A3A",
  },
  resultsContainer: {
    paddingBottom: Dimensions.get("screen").height * 0.17,
  },
  content: {
    backgroundColor: Colors.WHITE_COLOR,
    paddingBottom: Dimensions.get("screen").width * 0.25,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  cardTitle: {
    color: Colors.GREY_COLOR,
    paddingHorizontal: 10,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.WHITE_COLOR,
    shadowColor: "#002751",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: 15,
    borderColor: Colors.BORDER_COLOR,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: Dimensions.get("window").width * 0.03,
  },
  storeImageContainer: {
    backgroundColor: "white",
    marginRight: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.43,
    shadowRadius: 9.51,
    height: Dimensions.get("screen").width * 0.15,
    width: Dimensions.get("screen").width * 0.15,
    elevation: 2,
    borderRadius: 4,
  },
  storeImage: {
    aspectRatio: 1,
    height: Dimensions.get("screen").width * 0.15,
    width: Dimensions.get("screen").width * 0.15,
    borderRadius: 4,
  },
  storeInfo: {
    marginLeft: 10,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  providerName: {
    color: "black",
    fontSize: 14,
    fontWeight: "500",
    maxWidth: Dimensions.get("window").width * 0.3,
  },
  storeMetrics: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },
  ratingText: {
    color: "black",
    fontSize: 13,
    fontWeight: "400",
    marginRight: 2,
  },
  domainName: {
    color: "black",
    fontSize: 13,
  },
  offerText: {
    color: "#00BC66",
    fontSize: 13,
    fontWeight: "500",
  },
  scrollViewStyle: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
  },
  productItemFood: {
    width: windowWidth * 0.7,
    borderColor: "#ACAAAA",
    borderWidth: 1,
    marginLeft: Dimensions.get("window").width * 0.03,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
  },
  foodItemContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productImageContainer: {
    borderColor: "#ACAAAA",
    borderWidth: 0.5,
    borderRadius: 10,
    marginVertical: 10,
  },
  productImageFood: {
    height: 100,
    width: 100,
    borderRadius: 10,
    borderColor: "#ACAAAA",
    borderWidth: 1,
  },
  addButtonArea: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
  },
  addButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  customizableText: {
    fontSize: 10,
    color: "#A29D9D",
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 5,
  },
  productDetails: {
    flex: 1,
  },
  vegIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  bestSellerText: {
    color: "#1DA578",
    marginHorizontal: 10,
  },
  productNameFood: {
    color: "black",
    fontSize: 14,
    textAlign: "left",
    width: windowWidth * 0.3,
    marginRight: 10,
    fontWeight: "500",
  },
  priceText: {
    color: "black",
    fontSize: 13,
  },
  originalPriceText: {
    textDecorationLine: "line-through",
    fontSize: 13,
    color: "#B8B4B4",
    marginHorizontal: 8,
  },
  offerPercentText: {
    color: "#00BC66",
    fontSize: 13,
  },
  moreInfoButton: {
    borderColor: "#A29D9D",
    borderWidth: 1,
    borderRadius: 100,
    width: 70,
    marginVertical: 10,
    paddingVertical: 2,
  },
  moreInfoText: {
    fontSize: 12,
    color: "#A29D9D",
    fontWeight: "500",
    textAlign: "center",
  },
  productRating: {
    flexDirection: "row",
    marginBottom: 8,
  },
  productItem: {
    width: windowWidth * 0.42,
    borderColor: "#ACAAAA",
    borderWidth: 1,
    marginLeft: Dimensions.get("window").width * 0.02,
    marginRight: Dimensions.get("window").width * 0.02,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
  },
  groceryImageContainer: {
    borderRadius: 10,
    marginVertical: 10,
    height: Dimensions.get("screen").width * 0.25,
    width: Dimensions.get("screen").width * 0.35,
  },
  groceryImage: {
    height: Dimensions.get("screen").width * 0.3,
    borderRadius: 10,
    width: Dimensions.get("screen").width * 0.35,
    borderColor: "#ACAAAA",
    borderWidth: 1,
  },
  addButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
  },
  groceryProductDetails: {
    marginVertical: width * 0.03,
    width: Dimensions.get("screen").width * 0.35,
  },
  productName: {
    color: "black",
    fontSize: 14,
    textAlign: "left",
    fontWeight: "500",
  },
  unitContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  unitText: {
    color: "#B8B4B4",
    marginLeft: 2,
  },
  otherDomainImageContainer: {
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
  otherDomainImage: {
    height: width * 0.42,
    width: width * 0.42,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: "#ACAAAA",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  otherDomainProductDetails: {
    marginVertical: 10,
    marginHorizontal: width * 0.03,
  },
  offerPercentBold: {
    color: "#00BC66",
    fontWeight: "600",
  },
  storeCard: {
    flexDirection: "row",
    marginHorizontal: Dimensions.get("screen").width * 0.04,
    marginTop: Dimensions.get("screen").width * 0.05,
    justifyContent: "flex-start",
    paddingHorizontal: Dimensions.get("screen").width * 0.03,
    paddingVertical: Dimensions.get("screen").width * 0.03,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F5F7F8",
  },
  storeCardImage: {
    aspectRatio: 1,
    height: 60,
    borderRadius: 100,
  },
  storeCardDetails: {
    marginHorizontal: Dimensions.get("screen").width * 0.03,
  },
  storeCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3B40",
  },
  storeCardMetrics: {
    flexDirection: "row",
    marginVertical: 4,
  },
  storeCardRating: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  storeCardRatingText: {
    fontSize: 14,
    fontWeight: "400",
  },
  storeCardOffer: {
    color: "#00BC66",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 10,
  },
  storeCardAddress: {
    color: "#3D3B40",
    fontWeight: "500",
    fontSize: 13,
  },
  storeCardDelivery: {
    marginVertical: 4,
    color: "#73777B",
    fontSize: 13,
  },
});


