import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import PLPElectronics from "../../../../../components/Product Listing Page/Electronics/PLPElectronics";
import PLPFashion from "../../../../../components/Product Listing Page/Fashion/PLPFashion";
import PLPBanner from "../../../../../components/Product Listing Page/FoodAndBeverages/PLPBanner";
import PLPFnB from "../../../../../components/Product Listing Page/FoodAndBeverages/PLPFnB";
import Searchbox from "../../../../../components/Product Listing Page/FoodAndBeverages/Searchbox";
import PLPGrocery from "../../../../../components/Product Listing Page/Grocery/PLPGrocery";
import PLPHomeAndDecor from "../../../../../components/Product Listing Page/HomeAndDecor/PLPHomeAndDecor";
import PLPPersonalCare from "../../../../../components/Product Listing Page/PersonalCare/PLPPersonalCare";
import FoodDetailsComponent from "../../../../../components/ProductDetails/FoodDetails";
import Loader from "../../../../../components/common/Loader";
import { fetchStoreDetails } from "../../../../../components/store/fetch-store-details";
import { fetchStoreItems } from "../../../../../components/store/fetch-store-items";
import { FetchStoreDetailsResponseType } from "../../../../../components/store/fetch-store-details-type";
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
// Helper methods
// ==============
const safeNormalize = (val?: string) =>
  typeof val === "string" ? val.toLowerCase().trim() : "";

const getFirst = (maybeArr: string | string[] | undefined): string =>
  Array.isArray(maybeArr) ? maybeArr[0] : maybeArr ?? "";

// ✅ FIXED: Enhanced uniqueBy function with better key generation
const uniqueBy = <T,>(arr: T[], keyFn: (x: T) => string) => {
  const seen = new Set<string>();
  const out: T[] = [];
  let counter = 0;
  
  for (const item of arr) {
    const primaryKey = keyFn(item);
    let key = primaryKey;
    
    // If key is empty or already seen, generate a more unique key
    if (!key || seen.has(key)) {
      key = `${primaryKey}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
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
// Optimized types
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
  id: string; // using slug
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
        id: item.slug || item._id || "", // ensure a stable id
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

  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceable, setServiceable] = useState(false);
  const [searchString, setSearchString] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [paginatedCatalog, setPaginatedCatalog] = useState<
    ComponentCatalogItem[]
  >([]);

  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOpenPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

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

  const onInputChanged = useCallback((text: string) => {
    setSearchString(text);
    setCurrentPage(1);
    setPaginatedCatalog([]);
    setHasMoreItems(true);
  }, []);

  // ✅ FIXED: Enhanced deduplication with multiple fields
  const uniqueCatalogs = useMemo(() => {
    if (!vendorData?.catalogs) return [];
    
    // More robust deduplication using multiple fields
    return uniqueBy(vendorData.catalogs, (x) => {
      const id = x.id || x.catalog_id || '';
      const name = x.descriptor?.name || '';
      const categoryId = x.category_id || '';
      return `${id}::${name}::${categoryId}`;
    });
  }, [vendorData?.catalogs]);

  // Pagination logic
  const loadMoreItems = useCallback(() => {
    if (!uniqueCatalogs.length || isLoadingMore || !hasMoreItems) return;

    setIsLoadingMore(true);

    // Simulate a short async fetch for UX smoothness
    setTimeout(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = uniqueCatalogs.slice(startIndex, endIndex);

      if (!newItems.length) {
        setHasMoreItems(false);
      } else {
        setPaginatedCatalog((prev) => [...prev, ...newItems]);
        setCurrentPage((prev) => prev + 1);
      }
      setIsLoadingMore(false);
    }, 250);
  }, [uniqueCatalogs, currentPage, isLoadingMore, hasMoreItems]);

  const onEndReached = useCallback(() => {
    loadMoreItems();
  }, [loadMoreItems]);

  // Serviceability check (defensively normalized)
  const checkServiceable = useCallback(
    (vd: VendorData) => {
      try {
        const panIndia = !!vd?.panIndia;
        const selectedCity = safeNormalize(selectedDetails?.city);
        const vendorCity = safeNormalize(vd?.address?.city);

        setServiceable(
          panIndia || (!!selectedCity && selectedCity === vendorCity)
        );
      } catch (err) {
        console.error("Error checking serviceability:", err);
        setServiceable(false);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDetails?.city]
  );

  // ✅ FIXED: Updated fetchVendorData with better deduplication
  const fetchVendorData = useCallback(async () => {
    if (!vendorSlug) {
      setIsLoading(false);
      setError("Invalid store id.");
      return;
    }

    try {
      setError(null);
      const slug = vendorSlug;

      const [storeDetails, storeItems] = await Promise.all([
        fetchStoreDetails(slug),
        fetchStoreItems(slug),
      ]);

      if (storeDetails && storeItems) {
        const convertedData = convertToVendorData(storeDetails, storeItems);
        if (convertedData) {
          setVendorData(convertedData);

          // Initialize pagination with better deduplication
          const deduped = uniqueBy(
            convertedData.catalogs,
            (x) => {
              const id = x.id || x.catalog_id || '';
              const name = x.descriptor?.name || '';
              const categoryId = x.category_id || '';
              return `${id}::${name}::${categoryId}`;
            }
          );
          
          const firstBatch = deduped.slice(0, ITEMS_PER_PAGE);
          setPaginatedCatalog(firstBatch);
          setHasMoreItems(deduped.length > ITEMS_PER_PAGE);

          checkServiceable(convertedData);
        } else {
          setError("Failed to process store data.");
          setIsLoading(false);
        }
      } else {
        setError("Store not found.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching vendor data:", err);
      setError("Failed to load store data.");
      setIsLoading(false);
    }
  }, [vendorSlug, checkServiceable]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setPaginatedCatalog([]);
    setHasMoreItems(true);
    await fetchVendorData();
    setRefreshing(false);
  }, [fetchVendorData]);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

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
            // Title-case the section without relying on toLowerCase on undefined
            .toLowerCase()
            .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
        )
        .join(", ") || "";

    const dropdownHeaders = Array.from(
      new Set((vendorData.catalogs || []).map((item) => item.category_id || ""))
    );

    return { vendorAddress, storeCategories, dropdownHeaders };
  }, [vendorData]);

  // Loading / error / empty
  if (isLoading) return <Loader />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchVendorData} style={styles.retryButton}>
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
            // ensure the path exists
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
          <PLPGrocery
            providerId={vendorSlug}
            catalog={paginatedCatalog}
            sidebarTitles={dropdownHeaders}
            searchString={searchString}
          />
        );

      case "ONDC:RET11":
        return (
          <PLPFnB
            buttonTitles={[]}
            descriptor={vendorData.descriptor}
            vendorAddress={vendorAddress}
            catalog={paginatedCatalog}
            dropdownHeaders={dropdownHeaders}
            street={vendorData.address?.street || ""}
            fssaiLiscenseNo={vendorData.fssai_license_no || ""}
            providerId={vendorSlug}
            handleOpenPress={handleOpenPress}
            foodDetails={setFoodDetails}
            searchString={searchString}
          />
        );

      case "ONDC:RET12":
        return (
          <PLPFashion headers={dropdownHeaders} catalog={paginatedCatalog} providerId={vendorSlug} />
        );

      case "ONDC:RET13":
        return (
          <PLPPersonalCare
            providerId={vendorSlug}
            catalog={paginatedCatalog}
            sidebarTitles={dropdownHeaders}
            searchString={searchString}
          />
        );

      case "ONDC:RET14":
        return (
          <PLPElectronics
            providerId={vendorSlug}
            catalog={paginatedCatalog}
            sidebarTitles={dropdownHeaders}
            searchString={searchString}
          />
        );

      case "ONDC:RET16":
        return <PLPHomeAndDecor catalog={paginatedCatalog} />;

      default:
        return (
          <Text style={styles.invalidDomainText}>Unsupported store type</Text>
        );
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
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
              vendorId={vendorSlug} // vendor slug/id for store favorites
            />

            {renderProductListingPage()}
            {renderFooter()}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        keyExtractor={() => "plp-content"} // safe: single element
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
    width: widthPercentageToDP("100%"), // ✅ needs a percent
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