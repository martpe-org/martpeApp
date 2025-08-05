import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import PLPElectronics from "../../../../components/Product Listing Page/Electronics/PLPElectronics";
import PLPFashion from "../../../../components/Product Listing Page/Fashion/PLPFashion";
import PLPBanner from "../../../../components/Product Listing Page/FoodAndBeverages/PLPBanner";
import PLPFnB from "../../../../components/Product Listing Page/FoodAndBeverages/PLPFnB";
import Searchbox from "../../../../components/Product Listing Page/FoodAndBeverages/Searchbox";
import PLPGrocery from "../../../../components/Product Listing Page/Grocery/PLPGrocery";
import PLPHomeAndDecor from "../../../../components/Product Listing Page/HomeAndDecor/PLPHomeAndDecor";
import PLPPersonalCare from "../../../../components/Product Listing Page/PersonalCare/PLPPersonalCare";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";
import Loader from "../../../../components/common/Loader";
import { fetchProductDetails } from "../../../../components/product/fetch-product";
import { FetchProductDetail } from "../../../../components/product/fetch-product-type";
import useDeliveryStore from "../../../../state/deliveryAddressStore";

// Types
interface Coords {
  accuracy: number;
  altitude: number;
  altitudeAccuracy: number;
  heading: number;
  latitude: number;
  longitude: number;
  speed: number;
}

interface UserLocation {
  coords: Coords;
  mocked?: boolean;
  timestamp: number;
}

// Types matching the component interfaces
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
    available: {
      count: number;
    };
    maximum: {
      count: number;
    };
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

// Mock function to convert FetchProductDetail to VendorData format
const convertToVendorData = (
  productDetail: FetchProductDetail
): VendorData | null => {
  if (!productDetail) return null;

  // Create a proper descriptor object matching ComponentDescriptor
  const descriptor: ComponentDescriptor = {
    images: productDetail.images || [],
    name: productDetail.name || "",
    symbol: productDetail.symbol || "",
  };

  // Create a mock catalog item from the product detail
  const catalogItem: ComponentCatalogItem = {
    bpp_id: productDetail.provider_id || "",
    bpp_uri: "", // Not available in FetchProductDetail
    catalog_id: productDetail.catalog_id || "",
    category_id: productDetail.category_id || "",
    descriptor: {
      images: productDetail.images || [],
      long_desc: productDetail.long_desc || "",
      name: productDetail.name || "",
      short_desc: productDetail.short_desc || "",
      symbol: productDetail.symbol || "",
    },
    id: productDetail._id || "",
    location_id: productDetail.location_id || "",
    non_veg: false, // Not available in FetchProductDetail, defaulting to false
    price: {
      maximum_value:
        productDetail.price?.maximum_value || productDetail.price?.value || 0,
      offer_percent: productDetail.price?.offerPercent || null,
      offer_value: null, // Not available in FetchProductDetail
      value: productDetail.price?.value || 0,
    },
    quantity: {
      available: {
        count: productDetail.quantity || 0,
      },
      maximum: {
        count: productDetail.quantity || 0,
      },
    },
    provider_id: productDetail.provider_id || "",
    veg: true, // Not available in FetchProductDetail, defaulting to true
  };

  return {
    address: {
      area_code: productDetail.store?.address?.area_code || "",
      city: productDetail.store?.address?.city || "",
      locality: productDetail.store?.address?.locality || "",
      state: productDetail.store?.address?.state || "",
      street: productDetail.store?.address?.street || "",
    },
    catalogs: [catalogItem], // Create array with single item
    descriptor: descriptor,
    fssai_license_no: productDetail.meta?.fssai_license_no || "",
    geoLocation: {
      lat: productDetail.gps?.lat || 0,
      lng: productDetail.gps?.lon || 0,
      point: {
        coordinates: [productDetail.gps?.lon || 0, productDetail.gps?.lat || 0],
        type: "Point",
      },
    },
    storeSections: [productDetail.category || ""],
    domain: productDetail.domain || "",
    time_to_ship_in_hours: {
      avg: productDetail.tts_in_h || 0,
      max: productDetail.tts_in_h || 0,
      min: productDetail.tts_in_h || 0,
    },
    panIndia: false, // This would need to be determined from your business logic
    hyperLocal: true,
  };
};

const PLP: React.FC = () => {
  const vendor = useLocalSearchParams();
  const animation = useRef(null);
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const [foodDetails, setFoodDetails] = useState({
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
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenPress = () => bottomSheetRef.current?.expand();
  const handleCollapsePress = () => bottomSheetRef.current?.collapse();
  const snapeToIndex = (index: number) =>
    bottomSheetRef.current?.snapToIndex(index);
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

  // Fetch vendor data
  useEffect(() => {
    async function fetchVendorData() {
      if (!vendor.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the slug (vendor.id) directly as fetchProductDetails expects
        const productDetail = await fetchProductDetails(vendor.id as string);

        if (productDetail) {
          const convertedData = convertToVendorData(productDetail);
          if (convertedData) {
            setVendorData(convertedData);
            checkServiceable(convertedData);
          } else {
            setIsLoading(false);
            setServiceable(false);
          }
        } else {
          setIsLoading(false);
          setServiceable(false);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setIsLoading(false);
        setServiceable(false);
      }
    }

    fetchVendorData();
  }, [vendor.id]);

  const checkServiceable = (vendorData: VendorData) => {
    const panIndia = vendorData?.panIndia;
    console.log("panIndia", panIndia);
    console.log("selectedDetails", selectedDetails);
    console.log("vendorData", vendorData?.address?.city);

    // Convert both cities to lowercase and trim them for a fair comparison
    const selectedCity = selectedDetails?.city?.toLowerCase().trim();
    const vendorCity = vendorData?.address?.city?.toLowerCase().trim();

    console.log("Comparing cities:", selectedCity, "vs", vendorCity);

    if (panIndia || selectedCity === vendorCity) {
      console.log("Serviceable: true");
      setIsLoading(false);
      setServiceable(true);
    } else {
      console.log("Serviceable: false");
      setIsLoading(false);
      setServiceable(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!vendorData) {
    return (
      <View style={styles.contentContainer}>
        <Text style={{ color: "black" }}>No data available</Text>
      </View>
    );
  }

  if (!serviceable) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingBottom: 30,
        }}
      >
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            ref={animation}
            style={{
              width: widthPercentageToDP("100"),
              backgroundColor: "#fff",
            }}
            source={require("../../../../assets/lottiefiles/no_store.json")}
          />
        </View>

        <View style={{ height: 50, alignItems: "center" }}>
          <Text
            style={{
              color: "#909095",
              fontWeight: "500",
              paddingHorizontal: Dimensions.get("screen").width * 0.1,
              textAlign: "center",
              fontSize: 16,
            }}
          >
            The store is currently not serviceable in your area
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/address/SavedAddresses")}
          style={{
            backgroundColor: "#030303",
            width: widthPercentageToDP("90"),
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 50,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 20 }}>
            <MaterialCommunityIcons size={20} name="map-marker" />
            Change Location
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("../(tabs)/home")}
          style={{
            borderColor: "#030303",
            width: widthPercentageToDP("90"),
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 50,
            alignItems: "center",
            borderWidth: 2,
            marginVertical: 10,
          }}
        >
          <Text style={{ color: "#030303", fontWeight: "600", fontSize: 20 }}>
            View other stores
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Banner data
  const { locality, street, city, state, area_code } =
    vendorData?.address || {};
  const vendorAddress = [locality, street, city, state, area_code]
    .filter((data) => data)
    .join(", ");

  const descriptor = vendorData?.descriptor || {};

  // Formatting the categories
  const storeCategories = vendorData.storeSections?.map((section) =>
    section
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toLowerCase())
      .replace(/^\w/, (c) => c.toUpperCase())
  );
  const storeSections = storeCategories?.join(", ") || "";
  const locationDetails = vendorData.geoLocation;

  // Dropdown data
  const catalog = vendorData.catalogs || [];
  function getUniqueCategories(data: ComponentCatalogItem[]) {
    return Array.from(new Set(data.map((item) => item.category_id)));
  }
  const dropdownHeaders = getUniqueCategories(catalog);

  // Footer data
  const fssaiLiscenseNo = vendorData.fssai_license_no || "";

  const buttonTitles = Array.from(
    new Set(
      vendorData.catalogs?.flatMap((button) =>
        Object.keys(button).flatMap((key) =>
          key !== "title" &&
          ["veg", "nonveg", "recommended", "topRated", "offers"].includes(
            key
          ) &&
          typeof (button as any)[key] === "boolean" &&
          (button as any)[key]
            ? key
            : []
        )
      ) || []
    )
  ).map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  const domain: string = vendorData.domain;

  // ||||||||||||||||| RENDER COMPONENTS BASED ON VENDOR DOMAIN |||||||||||||||||
  let ProductListingPage;
  switch (domain) {
    case "ONDC:RET10":
      ProductListingPage = (
        <PLPGrocery
          providerId={vendor?.id as string}
          catalog={catalog}
          sidebarTitles={dropdownHeaders}
          searchString={searchString}
        />
      );
      break;

    case "ONDC:RET11":
      ProductListingPage = (
        <PLPFnB
          buttonTitles={buttonTitles}
          descriptor={descriptor}
          vendorAddress={vendorAddress}
          catalog={catalog}
          dropdownHeaders={dropdownHeaders}
          street={street || ""}
          fssaiLiscenseNo={fssaiLiscenseNo}
          providerId={vendor?.id as string}
          handleOpenModal={handleOpenPress}
          foodDetails={setFoodDetails}
          searchString={searchString}
        />
      );
      break;
    case "ONDC:RET12":
      ProductListingPage = (
        <PLPFashion headers={dropdownHeaders} catalog={catalog} />
      );
      break;
    case "ONDC:RET13":
      ProductListingPage = (
        <PLPPersonalCare
          providerId={vendor.id as string}
          catalog={catalog}
          sidebarTitles={dropdownHeaders}
          searchString={searchString}
        />
      );
      break;
    case "ONDC:RET14":
      ProductListingPage = (
        <PLPElectronics
          providerId={vendor.id as string}
          catalog={catalog}
          sidebarTitles={dropdownHeaders}
          searchString={searchString}
        />
      );
      break;
    case "ONDC:RET15":
      ProductListingPage = <Text>Create Elements for RET15</Text>;
      break;
    case "ONDC:RET16":
      ProductListingPage = <PLPHomeAndDecor catalog={catalog} />;
      break;

    default:
      ProductListingPage = <Text>Invalid Domain</Text>;
      break;
  }

  const onInputChanged = (text: string) => {
    setSearchString(text);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        {/* store banner */}
        <PLPBanner
          address={vendorAddress}
          descriptor={descriptor}
          storeSections={storeSections}
          geoLocation={locationDetails}
          userLocation={selectedDetails}
          userAddress={selectedDetails?.fullAddress}
          vendorId={vendor.id as string}
        />

        {/* store search box */}
        <Searchbox
          search={onInputChanged}
          placeHolder={descriptor.name || "Store"}
          catalog={catalog}
        />

        {/* plp page */}
        {ProductListingPage}
      </ScrollView>

      {/* product listing page item customization bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        backdropComponent={renderBackdrop}
      >
        {foodDetails?.visible && (
          <FoodDetailsComponent foodDetails={foodDetails} />
        )}
      </BottomSheet>
    </View>
  );
};

export default PLP;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
  },
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
