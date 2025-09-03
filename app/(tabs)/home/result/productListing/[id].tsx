import GroceryCardContainer from "@/components/Product-Listing-Page/Grocery/GroceryCardContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import PLPElectronics from "../../../../../components/Product-Listing-Page/Electronics/PLPElectronics";
import PLPFashion from "../../../../../components/Product-Listing-Page/Fashion/PLPFashion";
import PLPBanner from "../../../../../components/Product-Listing-Page/FoodAndBeverages/PLPBanner";
import Searchbox from "../../../../../components/Product-Listing-Page/FoodAndBeverages/Searchbox";
import PLPHomeAndDecor from "../../../../../components/Product-Listing-Page/HomeAndDecor/PLPHomeAndDecor";
import PLPPersonalCare from "../../../../../components/Product-Listing-Page/PersonalCare/PLPPersonalCare";
import FoodDetailsComponent from "../../../../../components/ProductDetails/FoodDetails";
import Loader from "../../../../../components/common/Loader";
import { fetchStoreDetails } from "../../../../../components/store/fetch-store-details";
import { FetchStoreDetailsResponseType } from "../../../../../components/store/fetch-store-details-type";
import { fetchStoreItems } from "../../../../../components/store/fetch-store-items";
import {
  FetchStoreItemsResponseType,
  StoreItem,
} from "../../../../../components/store/fetch-store-items-type";
import useDeliveryStore from "../../../../../state/deliveryAddressStore";

// ===================
// Pagination constants
// ===================
const ITEMS_PER_PAGE = 20;

// ==============
// Query Keys
// ==============
const queryKeys = {
  storeDetails: (slug: string) => ["store-details", slug] as const,
  storeItems: (slug: string, page: number, search: string) =>
    ["store-items", slug, page, search] as const,
  storeItemsInfinite: (slug: string, search: string) =>
    ["store-items-infinite", slug, search] as const,
};

// ==============
// Helper methods
// ==============
const safeNormalize = (val?: string) =>
  typeof val === "string" ? val.toLowerCase().trim() : "";

const getFirst = (maybeArr: string | string[] | undefined): string =>
  Array.isArray(maybeArr) ? maybeArr[0] : maybeArr ?? "";

// ✅ Enhanced uniqueBy function with better key generation
const uniqueBy = <T,>(arr: T[], keyFn: (x: T) => string) => {
  const seen = new Set<string>();
  const out: T[] = [];
  let counter = 0;

  for (const item of arr) {
    const primaryKey = keyFn(item);
    let key = primaryKey;

    if (!key || seen.has(key)) {
      key = `${primaryKey}_${counter}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      counter++;
    }

    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
};

// ===================
// Types
// ===================
interface ComponentDescriptor {
  images: string[];
  name: string;
  symbol: string;
}

interface ComponentCatalogItem {
  bpp_id: string;
  bpp_uri: string;
  catalog_id: string;
  category_id: string;
  descriptor: {
    images: string[];
    long_desc: string;
    name: string;
    short_desc: string;
    symbol: string;
  };
  id: string;
  location_id: string;
  non_veg: boolean | null;
  price: {
    maximum_value: number;
    offer_percent: number | null;
    offer_value: number | null;
    value: number;
  };
  quantity: {
    available: { count: number };
    maximum: { count: number };
  };
  provider_id: string;
  veg: boolean;
}

interface VendorData {
  address?: {
    area_code?: string;
    city?: string;
    locality?: string;
    state?: string;
    street?: string;
  };
  catalogs: ComponentCatalogItem[];
  descriptor: ComponentDescriptor;
  fssai_license_no?: string;
  geoLocation: {
    lat: number;
    lng: number;
    point: {
      coordinates: number[];
      type: string;
    };
  };
  storeSections: string[];
  domain: string;
  time_to_ship_in_hours: {
    avg: number;
    max: number;
    min: number;
  };
  panIndia: boolean;
  hyperLocal: boolean;
}

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

interface PaginatedStoreItemsResponse {
  items: ComponentCatalogItem[];
  hasNextPage: boolean;
  totalCount: number;
}

// ================================
// API Functions for TanStack Query
// ================================
const fetchStoreDetailsQuery = async (
  slug: string
): Promise<VendorData | null> => {
  if (!slug) throw new Error("Store slug is required");

  const [storeDetails, storeItems] = await Promise.all([
    fetchStoreDetails(slug),
    fetchStoreItems(slug),
  ]);

  if (!storeDetails || !storeItems) {
    throw new Error("Failed to fetch store data");
  }

  return convertToVendorData(storeDetails, storeItems);
};

const fetchStoreItemsPaginated = async ({
  slug,
  pageParam = 1,
  searchString = "",
}: {
  slug: string;
  pageParam: number;
  searchString: string;
}): Promise<PaginatedStoreItemsResponse> => {
  if (!slug) throw new Error("Store slug is required");

  // Fetch all items (you might need to modify your API to support pagination)
  const storeItems = await fetchStoreItems(slug);

  if (!storeItems?.results) {
    return { items: [], hasNextPage: false, totalCount: 0 };
  }

  // Convert to component format
  const allItems: ComponentCatalogItem[] = storeItems.results.map(
    (item: StoreItem) => ({
      bpp_id: item.provider_id || "",
      bpp_uri: "",
      catalog_id: item.catalog_id || "",
      category_id: item.category_id || "",
      descriptor: {
        images: item.images || [],
        long_desc: item.short_desc || "",
        name: item.name || "",
        short_desc: item.short_desc || "",
        symbol: item.symbol || "",
      },
      id: item.slug || item._id || "",
      location_id: item.location_id || "",
      non_veg: item.diet_type === "non_veg",
      price: {
        maximum_value: item.price?.maximum_value ?? item.price?.value ?? 0,
        offer_percent: item.price?.offerPercent ?? null,
        offer_value: null,
        value: item.price?.value ?? 0,
      },
      quantity: {
        available: { count: item.quantity ?? 0 },
        maximum: { count: item.quantity ?? 0 },
      },
      provider_id: item.provider_id || "",
      veg: item.diet_type === "veg" || item.diet_type !== "non_veg",
    })
  );

  // Apply search filter
  let filteredItems = allItems;
  if (searchString.trim()) {
    const searchTerm = searchString.toLowerCase();
    filteredItems = allItems.filter(
      (item) =>
        item.descriptor.name.toLowerCase().includes(searchTerm) ||
        item.descriptor.short_desc.toLowerCase().includes(searchTerm) ||
        item.category_id.toLowerCase().includes(searchTerm)
    );
  }

  // Apply deduplication
  const deduplicatedItems = uniqueBy(filteredItems, (x) => {
    const id = x.id || x.catalog_id || "";
    const name = x.descriptor?.name || "";
    const categoryId = x.category_id || "";
    return `${id}::${name}::${categoryId}`;
  });

  // Apply pagination
  const startIndex = (pageParam - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = deduplicatedItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    hasNextPage: endIndex < deduplicatedItems.length,
    totalCount: deduplicatedItems.length,
  };
};

// ================================
// Convert backend -> component data
// ================================
const convertToVendorData = (
  storeDetails: FetchStoreDetailsResponseType,
  storeItems: FetchStoreItemsResponseType
): VendorData | null => {
  try {
    if (!storeDetails || !storeItems?.results) return null;

    const descriptor: ComponentDescriptor = {
      images: storeDetails.images || [],
      name: storeDetails.name || "",
      symbol: storeDetails.symbol || "",
    };

    const catalogItems: ComponentCatalogItem[] = (storeItems.results || []).map(
      (item: StoreItem) => ({
        bpp_id: item.provider_id || "",
        bpp_uri: "",
        catalog_id: item.catalog_id || "",
        category_id: item.category_id || "",
        descriptor: {
          images: item.images || [],
          long_desc: item.short_desc || "",
          name: item.name || "",
          short_desc: item.short_desc || "",
          symbol: item.symbol || "",
        },
        id: item.slug || item._id || "",
        location_id: item.location_id || "",
        non_veg: item.diet_type === "non_veg",
        price: {
          maximum_value: item.price?.maximum_value ?? item.price?.value ?? 0,
          offer_percent: item.price?.offerPercent ?? null,
          offer_value: null,
          value: item.price?.value ?? 0,
        },
        quantity: {
          available: { count: item.quantity ?? 0 },
          maximum: { count: item.quantity ?? 0 },
        },
        provider_id: item.provider_id || "",
        veg: item.diet_type === "veg" || item.diet_type !== "non_veg",
      })
    );

    return {
      address: {
        area_code: storeDetails.address?.area_code || "",
        city: storeDetails.address?.city || "",
        locality: storeDetails.address?.locality || "",
        state: storeDetails.address?.state || "",
        street: storeDetails.address?.street || "",
      },
      catalogs: catalogItems,
      descriptor,
      fssai_license_no: storeDetails.fssai_license_no || "",
      geoLocation: {
        lat: storeDetails.gps?.lat || 0,
        lng: storeDetails.gps?.lon || 0,
        point: {
          coordinates: [storeDetails.gps?.lon || 0, storeDetails.gps?.lat || 0],
          type: "Point",
        },
      },
      storeSections: storeDetails.store_categories || [],
      domain: storeDetails.domain || "",
      time_to_ship_in_hours: {
        avg: storeDetails.avg_tts_in_h || 0,
        max: storeDetails.max_tts_in_h || storeDetails.avg_tts_in_h || 0,
        min: storeDetails.avg_tts_in_h || 0,
      },
      panIndia: !!storeDetails.isPanindia,
      hyperLocal: !!storeDetails.isHyperLocalOnly,
    };
  } catch (error) {
    console.error("Error converting vendor data:", error);
    return null;
  }
};

const PLP: React.FC = () => {
  const vendor = useLocalSearchParams();
  const vendorSlug = getFirst(vendor.id);
  const animation = useRef<LottieView>(null);
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const queryClient = useQueryClient();

  // State
  const [foodDetails, setFoodDetails] = useState<FoodDetails>({
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

  const [searchString, setSearchString] = useState<string>("");

  // ✅ TanStack Query for store details
  const {
    data: vendorData,
    isLoading: isLoadingVendor,
    error: vendorError,
    refetch: refetchVendor,
  } = useQuery({
    queryKey: queryKeys.storeDetails(vendorSlug),
    queryFn: () => fetchStoreDetailsQuery(vendorSlug),
    enabled: !!vendorSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // ✅ TanStack Infinite Query for paginated store items
  const {
    data: infiniteItemsData,
    isLoading: isLoadingItems,
    error: itemsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchItems,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: queryKeys.storeItemsInfinite(vendorSlug, searchString),
    queryFn: ({ pageParam = 1 }) =>
      fetchStoreItemsPaginated({
        slug: vendorSlug,
        pageParam,
        searchString,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined;
    },
    enabled: !!vendorSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten paginated data
  const allItems = useMemo(() => {
    return infiniteItemsData?.pages?.flatMap((page) => page.items) || [];
  }, [infiniteItemsData]);

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

  // ✅ Search handler with query invalidation
  const onInputChanged = useCallback(
    (text: string) => {
      setSearchString(text);
      // Invalidate and refetch with new search term
      queryClient.invalidateQueries({
        queryKey: queryKeys.storeItemsInfinite(vendorSlug, text),
      });
    },
    [vendorSlug, queryClient]
  );

  // ✅ Load more items handler
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ✅ Refresh handler
  const onRefresh = useCallback(async () => {
    await Promise.all([refetchVendor(), refetchItems()]);
  }, [refetchVendor, refetchItems]);

  // Serviceability check
  const serviceable = useMemo(() => {
    if (!vendorData) return false;

    try {
      const panIndia = !!vendorData?.panIndia;
      const selectedCity = safeNormalize(selectedDetails?.city);
      const vendorCity = safeNormalize(vendorData?.address?.city);

      return panIndia || (!!selectedCity && selectedCity === vendorCity);
    } catch (err) {
      console.error("Error checking serviceability:", err);
      return false;
    }
  }, [vendorData, selectedDetails?.city]);

  // Computed vendor info
  const { vendorAddress, storeCategories, dropdownHeaders } = useMemo(() => {
    if (!vendorData)
      return {
        vendorAddress: "",
        storeCategories: "",
        dropdownHeaders: [] as string[],
      };

    const { locality, street, city, state, area_code } =
      vendorData.address || {};
    const vendorAddress = [locality, street, city, state, area_code]
      .filter(Boolean)
      .join(", ");

    const storeCategories =
      vendorData.storeSections
        ?.map((section) =>
          section
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase()
            .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
        )
        .join(", ") || "";

    const dropdownHeaders = Array.from(
      new Set(allItems.map((item) => item.category_id || ""))
    );

    return { vendorAddress, storeCategories, dropdownHeaders };
  }, [vendorData, allItems]);

  // Loading states
  const isLoading = isLoadingVendor || isLoadingItems;
  const error = vendorError || itemsError;

  // Loading / error / empty
  if (isLoading && !infiniteItemsData) return <Loader />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "An error occurred"}
        </Text>
        <TouchableOpacity
          onPress={() => onRefresh()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!vendorData) {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  if (!serviceable) {
    return (
      <View style={styles.unserviceableContainer}>
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            ref={animation}
            style={styles.lottieAnimation}
            source={require("../../../../../assets/lottiefiles/no_store.json")}
          />
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.unserviceableText}>
            The store is currently not serviceable in your area
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/address/SavedAddresses")}
          style={styles.primaryButton}
        >
          <MaterialCommunityIcons size={20} name="map-marker" />
          <Text style={styles.primaryButtonText}>Change Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("./(tabs)/home")}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>View other stores</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Choose PLP by domain
  const renderProductListingPage = () => {
    const domain = vendorData.domain;

    switch (domain) {
      case "ONDC:RET10":
        return (
          <GroceryCardContainer
            catalog={allItems}
            searchString={searchString}
          />
        );

      case "ONDC:RET12":
        return <PLPFashion headers={dropdownHeaders} catalog={allItems} />;

      case "ONDC:RET13":
        return (
          <PLPPersonalCare
            providerId={vendorSlug}
            catalog={allItems}
            sidebarTitles={dropdownHeaders}
            searchString={searchString}
          />
        );

      case "ONDC:RET14":
        return (
          <PLPElectronics
            catalog={allItems}
            sidebarTitles={dropdownHeaders}
            searchString={searchString}
          />
        );

      case "ONDC:RET16":
        return <PLPHomeAndDecor catalog={allItems} />;

      default:
        return (
          <Text style={styles.invalidDomainText}>Unsupported store type</Text>
        );
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading more items...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]} // single container
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
              userLocation={selectedDetails}
              userAddress={selectedDetails?.fullAddress ?? ""}
              vendorId={vendorSlug}
            />

            {renderProductListingPage()}
            {renderFooter()}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={["#030303"]}
            tintColor="#030303"
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        keyExtractor={() => "plp-content"}
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
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
    </View>
  );
};

export default React.memo(PLP);

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#030303",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  noDataText: {
    color: "#333",
    fontSize: 16,
  },
  unserviceableContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 30,
  },
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  lottieAnimation: {
    width: widthPercentageToDP("100%"),
    backgroundColor: "#fff",
  },
  messageContainer: {
    height: 50,
    alignItems: "center",
    paddingHorizontal: width * 0.1,
  },
  unserviceableText: {
    color: "#909095",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#030303",
    width: widthPercentageToDP("90%"),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 20,
  },
  secondaryButton: {
    borderColor: "#030303",
    width: widthPercentageToDP("90%"),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
    marginVertical: 10,
  },
  secondaryButtonText: {
    color: "#030303",
    fontWeight: "600",
    fontSize: 20,
  },
  invalidDomainText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
  bottomSheetIndicator: {
    backgroundColor: "#fff",
  },
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
  },
});
