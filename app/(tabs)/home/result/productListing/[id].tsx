import GroceryCardContainer from "@/components/Product-Listing-Page/Grocery/GroceryCardContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
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
import Loader from "../../../../../components/common/Loader";
import { fetchStoreDetails } from "../../../../../components/store/fetch-store-details";
import { FetchStoreDetailsResponseType } from "../../../../../components/store/fetch-store-details-type";
import { fetchStoreItems } from "../../../../../components/store/fetch-store-items";
import { FetchStoreItemsResponseType, StoreItem } from "../../../../../components/store/fetch-store-items-type";
import useDeliveryStore from "../../../../../state/deliveryAddressStore";

// Types
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
  _id: string;
  address?: {
    area_code?: string;
    city?: string;
    locality?: string;
    state?: string;
    street?: string;
  };
  catalogs: ComponentCatalogItem[];
  descriptor: {
    images: string[];
    name: string;
    symbol: string;
  };
  domain: string;
  geoLocation: {
    lat: number;
    lng: number;
  };
  storeSections: string[];
  panIndia: boolean;
  hyperLocal: boolean;
}

interface ErrorState {
  message: string;
  retry?: boolean;
}

// Helper functions
const getFirst = (maybeArr: string | string[] | undefined): string =>
  Array.isArray(maybeArr) ? maybeArr[0] : maybeArr ?? "";

const safeNormalize = (val?: string) =>
  typeof val === "string" ? val.toLowerCase().trim() : "";

// Convert backend data to component format
const convertToVendorData = (
  storeDetails: FetchStoreDetailsResponseType,
  storeItems: FetchStoreItemsResponseType
): VendorData | null => {
  try {
    if (!storeDetails || !storeItems?.results) return null;

    const catalogItems: ComponentCatalogItem[] = storeItems.results.map(
      (item: StoreItem) => ({
        bpp_id: storeDetails._id,
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
        provider_id: storeDetails._id, // Use actual store ID
        veg: item.diet_type === "veg" || item.diet_type !== "non_veg",
      })
    );

    return {
      _id: storeDetails._id,
      address: {
        area_code: storeDetails.address?.area_code || "",
        city: storeDetails.address?.city || "",
        locality: storeDetails.address?.locality || "",
        state: storeDetails.address?.state || "",
        street: storeDetails.address?.street || "",
      },
      catalogs: catalogItems,
      descriptor: {
        images: storeDetails.images || [],
        name: storeDetails.name || "",
        symbol: storeDetails.symbol || "",
      },
      domain: storeDetails.domain || "",
      geoLocation: {
        lat: storeDetails.gps?.lat || 0,
        lng: storeDetails.gps?.lon || 0,
      },
      storeSections: storeDetails.store_categories || [],
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
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchString, setSearchString] = useState<string>("");

  // Data fetching function
  const fetchData = useCallback(
    async (showLoader = true) => {
      if (!vendorSlug) {
        setError({ message: "Store ID is required", retry: false });
        setIsLoading(false);
        return;
      }

      try {
        if (showLoader) setIsLoading(true);
        setError(null);

        const [storeDetails, storeItems] = await Promise.all([
          fetchStoreDetails(vendorSlug),
          fetchStoreItems(vendorSlug),
        ]);

        if (storeDetails && storeItems) {
          const convertedData = convertToVendorData(storeDetails, storeItems);
          setVendorData(convertedData);
          console.log("Store details loaded successfully:", storeDetails.name);
        } else {
          setError({
            message: "Store not found or unavailable",
            retry: true,
          });
        }
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError({
          message: "Failed to load store details. Please check your connection.",
          retry: true,
        });
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [vendorSlug]
  );

  // Effect hooks
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const onInputChanged = useCallback((text: string) => {
    setSearchString(text);
  }, []);

  // Computed values
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

  const { vendorAddress, storeCategories, dropdownHeaders } = useMemo(() => {
    if (!vendorData)
      return {
        vendorAddress: "",
        storeCategories: "",
        dropdownHeaders: [] as string[],
      };

    const { locality, street, city, state, area_code } = vendorData.address || {};
    const vendorAddress = [locality, street, city, state, area_code]
      .filter(Boolean)
      .join(", ");

    const storeCategories = vendorData.storeSections
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
      new Set(vendorData.catalogs.map((item) => item.category_id || ""))
    );

    return { vendorAddress, storeCategories, dropdownHeaders };
  }, [vendorData]);

  // Render error component
  const renderError = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error?.message}</Text>
        {error?.retry && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tap to retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  // Render unserviceable component
  const renderUnserviceable = () => (
    <SafeAreaView style={styles.unserviceableContainer}>
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
    </SafeAreaView>
  );

  // Choose PLP component by domain
  const renderProductListingPage = () => {
    if (!vendorData) return null;

    const { domain, catalogs, _id: storeId, descriptor } = vendorData;

    switch (domain) {
      case "ONDC:RET10":
        return (
          <GroceryCardContainer
            catalog={catalogs}
            searchString={searchString}
            storeId={storeId}
            storeName={descriptor.name}
          />
        );

      case "ONDC:RET12":
        return (
          <PLPFashion
            headers={dropdownHeaders}
            catalog={catalogs}
            storeId={storeId}
            storeName={descriptor.name}
          />
        );

      case "ONDC:RET13":
        return (
          <PLPPersonalCare
            providerId={storeId}
            catalog={catalogs}
            sidebarTitles={dropdownHeaders}
            searchString={searchString}
          />
        );

      case "ONDC:RET14":
        return (
          <PLPElectronics
            catalog={catalogs}
            sidebarTitles={dropdownHeaders}
            searchString={searchString}
            storeId={storeId}
          />
        );

      case "ONDC:RET16":
        return <PLPHomeAndDecor catalog={catalogs} storeId={storeId} />;

      default:
        return (
          <Text style={styles.invalidDomainText}>Unsupported store type</Text>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Error state
  if (error) {
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

  // Unserviceable state
  if (!serviceable) {
    return renderUnserviceable();
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#030303"]}
            tintColor="#030303"
          />
        }
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default PLP;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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
    paddingHorizontal: 40,
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
});