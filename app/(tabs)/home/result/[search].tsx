import React, { FC, useEffect, useState, useRef } from "react";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
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

import { Colors } from "../../../../theme";
import ImageComp from "../../../../components/common/ImageComp";
import Loader from "../../../../components/common/Loader";
import AddToCart from "../../../../components/ProductDetails/AddToCart";
import useDeliveryStore from "../../../../state/deliveryAddressStore";
import CustomizationGroup from "../../../../components/ProductDetails/CustomizationGroup";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";
import FilterCard from "../../../../components/search/filterCard";
import {
  filters,
  offerData,
  deliveryData,
} from "../../../../constants/filters";

// Import search functions and types
import { searchProducts } from "../../../search/search-products";
import { searchStores } from "../../../search/search-stores";
import { ProductSearchResult } from "../../../search/search-products-type";
import { StoreSearchResult } from "../../../search/search-stores-type";

const { width } = Dimensions.get("window");
const snapInterval = width * 0.72;

// Types
interface SearchResult {
  catalogs: ProductSearchResult[];
  stores: StoreSearchResult[];
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

// SVG Components
const CircleSvg = () => (
  <View style={{ marginHorizontal: 4 }}>
    <Svg width={5} height={5} fill="none">
      <Circle cx={2.5} cy={2.5} r={2.5} fill="#000" />
    </Svg>
  </View>
);

const VegSvg = () => (
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

const ForwardArrowSvg: FC<{ margin?: number }> = ({ margin = 0 }) => (
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

const ClockSvg: FC<{ title: number }> = ({ title }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
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
    </Svg>
    <Text
      style={{
        color: "#666464",
        textAlign: "center",
        fontSize: 12,
        marginLeft: 12,
        paddingLeft: 4,
      }}
    >
      {Math.round(title * 60)} min
    </Text>
  </View>
);

const Results: FC = () => {
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

  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenPress = () => bottomSheetRef.current?.expand();

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

  const fetchSearchResults = async () => {
    if (!search || !selectedDetails?.lat || !selectedDetails?.lng) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchInput = {
        lat: selectedDetails.lat,
        lon: selectedDetails.lng,
        pincode: selectedDetails.pincode || "110001",
        query: search,
        domain: domainData,
        page: 1,
        size: 50,
      };

      const [productsResponse, storesResponse] = await Promise.all([
        searchProducts(searchInput),
        searchStores(searchInput),
      ]);

      setSearchResults({
        catalogs: productsResponse?.results || [],
        stores: storesResponse?.results || [],
      });

      if (
        (productsResponse?.results || []).length === 0 &&
        (storesResponse?.results || []).length > 0
      ) {
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
    new Set(catalogsData?.map((item) => item.category_id))
  ).map((category: string, index: number) => ({
    id: index + 1,
    label: category,
    value: category,
  }));

  const doesProductMatchFilters = (product: ProductSearchResult): boolean => {
    const isCategoryMatch =
      filterSelected.category.length === 0 ||
      filterSelected.category.includes(product.category_id);
    const isOfferMatch =
      (product.price.offerPercent || 0) >= filterSelected.offers;
    const isDeliveryMatch = (product.tts_in_h || 0) <= filterSelected.delivery;
    return isCategoryMatch && isOfferMatch && isDeliveryMatch;
  };

  const ProductCard: FC<{
    storeName: string;
    products: ProductSearchResult[];
  }> = ({ storeName, products }) => {
    const firstProduct = products[0];
    if (!firstProduct?.store) return null;

    const store = firstProduct.store;
    const domainName = getDomainName(firstProduct.domain);
    const filteredProducts = products.filter(doesProductMatchFilters);

    if (filteredProducts.length === 0) return null;

    const renderFoodCard = () => (
      <View style={[styles.card, { marginVertical: 10 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.storeInfoContainer}>
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
              <Text style={styles.providerName} numberOfLines={2}>
                {store.name}
              </Text>
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
                <Text style={styles.distanceText}>
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
            style={styles.arrowContainer}
            onPress={() =>
              router.push(`/(tabs)/home/result/productListing/${store.slug}`)
            }
          >
            <ForwardArrowSvg />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollViewContent}
        >
          {filteredProducts.map((product, index) => (
            <View key={index} style={styles.productItemFood}>
              <TouchableOpacity style={styles.foodItemContainer}>
                <View style={styles.foodImageSection}>
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
                            customGroup:
                              product.directlyLinkedCustomGroupIds || [],
                            itemId: product.symbol,
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
                          <Text style={styles.addButtonText}>ADD</Text>
                        </View>
                        <Text style={styles.customizableText}>
                          Customizable
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <AddToCart
                        storeId={product.store_id}
                        slug={product.slug} // ✅ actual product slug
                        catalogId={product.catalog_id} // ✅ actual catalog ID from backend
                        price={product.price?.value || 0}
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
                  <Text style={styles.productNameFood} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.priceContainer}>
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
                        ...customizableGroup,
                        customizable: false,
                      });
                      setIsFilterVisible(false);
                    }}
                  >
                    <Text style={styles.moreInfoText}>More Info</Text>
                  </TouchableOpacity>
                  <View style={styles.productRating}>
                    <Text style={styles.ratingText}>
                      {product.rating || "4.2"}
                    </Text>
                    <MaterialCommunityIcons
                      color="#FFC700"
                      size={16}
                      name="star"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );

    const renderGroceryCard = () => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.storeInfoContainer}>
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
              <Text style={styles.providerName} numberOfLines={2}>
                {store.name}
              </Text>
              <View style={styles.storeMetrics}>
                <ClockSvg title={firstProduct.tts_in_h || 1} />
                <CircleSvg />
                <Text style={styles.distanceText}>
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
            style={styles.arrowContainer}
            onPress={() =>
              router.push(`/(tabs)/home/result/productListing/${store.slug}`)
            }
          >
            <ForwardArrowSvg />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollViewContent}
        >
          {products.map((product, index) => (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(tabs)/home/result/productDetails/${product.slug}`
                )
              }
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
                <AddToCart
                  storeId={product.store_id}
                  slug={product.slug} // ✅ product slug from backend
                  catalogId={product.catalog_id} // ✅ catalog ID from backend
                  customizable={product.customizable || false}
                />
              </View>
              <View style={styles.groceryProductDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={styles.unitContainer}>
                  <Text style={styles.unitText}>
                    {product.unitized?.measure?.value}
                  </Text>
                  <Text style={styles.unitText}>
                    {product.unitized?.measure?.unit}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );

    const renderOtherDomainsCard = () => (
      <View style={[styles.card, { marginTop: 10 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.storeInfoContainer}>
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
              <Text style={styles.providerName} numberOfLines={2}>
                {store.name}
              </Text>
              <View style={styles.storeMetrics}>
                <ClockSvg title={firstProduct.tts_in_h || 1} />
                <CircleSvg />
                <Text style={styles.distanceText}>
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
            style={styles.arrowContainer}
            onPress={() =>
              router.push(`/(tabs)/home/result/productListing/${store.slug}`)
            }
          >
            <ForwardArrowSvg />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollViewContent}
        >
          {products.map((product, index) => (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(tabs)/home/result/productDetails/${product.slug}`
                )
              }
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
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={styles.priceContainer}>
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );

    if (domainName === "F&B") return renderFoodCard();
    if (domainName === "Grocery") return renderGroceryCard();
    if (["Fashion", "Electronics", "Home & Decor", "BPC"].includes(domainName))
      return renderOtherDomainsCard();
    return null;
  };

  const productsByStore = groupByStoreId(catalogsData);

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={25} color={Colors.BLACK_COLOR} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Anything you want</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/search", params: { domain: domainData } })
          }
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
              ITEMS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={isItem ? styles.inactive : styles.active}
            onPress={() => setIsItem(false)}
          >
            <Text
              style={isItem ? styles.inactiveTabText : styles.activeTabText}
            >
              OUTLETS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isItem ? (
        <View style={styles.itemsContainer}>
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
                    setFoodDetails({ ...foodDetails, visible: false });
                    setIsFilterVisible(true);
                    setCustomizableGroup({
                      ...customizableGroup,
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

                  <TouchableOpacity
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
                      setFoodDetails({ ...foodDetails, visible: false });
                      setCustomizableGroup({
                        ...customizableGroup,
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
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

              {(filterSelected.category.length > 0 ||
                filterSelected.delivery !== 100 ||
                filterSelected.offers !== 0) && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() =>
                    setFilterSelected({
                      category: [],
                      offers: 0,
                      delivery: 100,
                    })
                  }
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
        <View style={styles.outletsContainer}>
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
            {storesData.map((store, index) => (
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/(tabs)/home/result/productListing/${store.slug}`
                  )
                }
                key={index}
                style={styles.storeCard}
              >
                <View style={styles.storeCardImageContainer}>
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
                  <Text style={styles.storeCardName} numberOfLines={2}>
                    {store.name}
                  </Text>
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
                      {Math.ceil(store.maxStoreItemOfferPercent || 0) > 0 && (
                        <Text style={styles.storeCardOffer}>
                          Upto {Math.ceil(store.maxStoreItemOfferPercent || 0)}%
                          Off
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.storeCardAddressContainer}>
                    <Text style={styles.storeCardAddress} numberOfLines={2}>
                      <MaterialCommunityIcons name="map-marker" />
                      {store.address.street ? `${store.address.street}, ` : ""}
                      {store.address.city}
                    </Text>
                    <Text style={styles.storeCardDelivery}>
                      <MaterialCommunityIcons name="truck" />
                      {store.distance_in_km.toFixed(1)}km •{" "}
                      {Math.round((store.avg_tts_in_h || 1) * 60)} min
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
            selectOption={(value) => {
              setFilterSelected(value);
              handleClosePress();
            }}
          />
        )}

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
  headerContainer: {
    flexDirection: "column",
    paddingVertical: 10,
    backgroundColor: Colors.WHITE_COLOR,
    paddingTop: 40,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: width * 0.03,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    color: Colors.BLACK_COLOR,
    fontSize: 16,
    flex: 1,
  },
  searchContainer: {
    backgroundColor: Colors.WHITE_COLOR,
    flexDirection: "row",
    borderColor: "#C7C4C4",
    borderWidth: 2,
    alignItems: "center",
    borderRadius: 13,
    marginTop: 10,
    marginHorizontal: width * 0.03,
  },
  searchInput: {
    height: 50,
    flex: 1,
    paddingHorizontal: 15,
    color: "#8E8A8A",
  },
  searchIcon: {
    paddingHorizontal: 15,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  active: {
    paddingVertical: 10,
    width: "50%",
    borderBottomWidth: 2,
    borderBottomColor: "#77e68f",
    backgroundColor: "#ffff",
  },
  inactive: {
    paddingVertical: 10,
    width: "50%",
    borderBottomWidth: 2,
    borderBottomColor: "gray",
  },
  activeTabText: {
    textAlign: "center",
    color: "#479933",
    fontWeight: "500",
  },
  inactiveTabText: {
    textAlign: "center",
    color: "black",
  },
  itemsContainer: {
    flex: 1,
  },
  outletsContainer: {
    flex: 1,
  },
  filtersContainer: {
    marginHorizontal: width * 0.03,
    marginVertical: 10,
  },
  filtersScrollView: {
    flexDirection: "row",
  },
  filterButton: {
    borderWidth: 1,
    backgroundColor: "white",
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexDirection: "row",
  },
  filterButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: 12,
  },
  filterClearButton: {
    marginLeft: 5,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: "#F13A3A",
    backgroundColor: "white",
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: "#F13A3A",
    fontWeight: "600",
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
  },
  content: {
    backgroundColor: Colors.WHITE_COLOR,
    paddingBottom: 100,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  cardTitle: {
    color: Colors.GREY_COLOR,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
    fontSize: 16,
  },
  card: {
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
    alignItems: "flex-start",
    marginBottom: 10,
    marginHorizontal: width * 0.03,
  },
  storeInfoContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "flex-start",
  },
  storeImageContainer: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 9.51,
    height: width * 0.15,
    width: width * 0.15,
    elevation: 2,
    borderRadius: 4,
  },
  storeImage: {
    height: width * 0.15,
    width: width * 0.15,
    borderRadius: 4,
  },
  storeInfo: {
    marginLeft: 10,
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  providerName: {
    color: "black",
    fontSize: 14,
    fontWeight: "500",
    flexWrap: "wrap",
  },
  storeMetrics: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "black",
    fontSize: 13,
    fontWeight: "400",
    marginRight: 2,
  },
  distanceText: {
    color: "black",
    fontSize: 13,
  },
  offerText: {
    color: "#00BC66",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  arrowContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewStyle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
  },
  scrollViewContent: {
    paddingHorizontal: 10,
  },
  productItemFood: {
    width: width * 0.7,
    borderColor: "#ACAAAA",
    borderWidth: 1,
    marginRight: 15,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
  },
  foodItemContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  foodImageSection: {
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
    padding: 10,
  },
  vegIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  bestSellerText: {
    color: "#1DA578",
    marginLeft: 10,
    fontSize: 12,
  },
  productNameFood: {
    color: "black",
    fontSize: 14,
    fontWeight: "500",
    marginVertical: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginVertical: 3,
  },
  priceText: {
    color: "black",
    fontSize: 13,
    fontWeight: "600",
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
    alignSelf: "flex-start",
  },
  moreInfoText: {
    fontSize: 12,
    color: "#A29D9D",
    fontWeight: "500",
    textAlign: "center",
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  productItem: {
    width: width * 0.42,
    borderColor: "#ACAAAA",
    borderWidth: 1,
    marginRight: 15,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
  },
  groceryImageContainer: {
    borderRadius: 10,
    marginVertical: 10,
    height: width * 0.25,
    width: width * 0.35,
  },
  groceryImage: {
    height: width * 0.25,
    width: width * 0.35,
    borderRadius: 10,
    borderColor: "#ACAAAA",
    borderWidth: 1,
  },
  addButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
  },
  groceryProductDetails: {
    marginVertical: 10,
    width: width * 0.35,
    paddingHorizontal: 10,
  },
  productName: {
    color: "black",
    fontSize: 14,
    textAlign: "left",
    fontWeight: "500",
    marginBottom: 5,
  },
  unitContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  unitText: {
    color: "#B8B4B4",
    fontSize: 12,
    marginRight: 2,
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
    marginHorizontal: 15,
  },
  offerPercentBold: {
    color: "#00BC66",
    fontWeight: "600",
    fontSize: 12,
  },
  storeCard: {
    flexDirection: "row",
    marginHorizontal: width * 0.04,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "flex-start",
    backgroundColor: "#F5F7F8",
  },
  storeCardImageContainer: {
    marginRight: 15,
  },
  storeCardImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  storeCardDetails: {
    flex: 1,
  },
  storeCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3B40",
    marginBottom: 5,
  },
  storeCardMetrics: {
    flexDirection: "row",
    marginBottom: 8,
  },
  storeCardRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeCardRatingText: {
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 5,
    marginRight: 10,
  },
  storeCardOffer: {
    color: "#00BC66",
    fontSize: 14,
    fontWeight: "500",
  },
  storeCardAddressContainer: {
    flexDirection: "column",
  },
  storeCardAddress: {
    color: "#3D3B40",
    fontWeight: "500",
    fontSize: 13,
    marginBottom: 4,
  },
  storeCardDelivery: {
    color: "#73777B",
    fontSize: 13,
  },
});
