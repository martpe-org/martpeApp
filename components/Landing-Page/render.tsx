import React from "react";
import { Text, View } from "react-native";
import { Store2, HomeOfferType } from "../../hook/fetch-home-type";
import OffersCarousel from "./OffersCarousel";
import { RestaurantCard, OfferCard } from "./RestaurantCards";
import { 
  StoreCard, 
  CategoryItemCompact, 
  FoodCategoryRow, 
  GroceryCategoryRow 
} from "./StoreCategoriesCards";

interface renderProps {
  storeData: any;
  categoryFiltered: any[];
  userLocation: { lat: number; lng: number };
}

// Normalized store interface
export interface NormalizedStore {
  id: string;
  slug: string;
  descriptor: {
    name: string;
    short_desc: string;
    description: string;
    images: string[];
    symbol: string;
  };
  symbol: string;
  value: number;
  maxPrice: number;
  discount: number;
  calculated_max_offer: { percent: number };
  status: string;
  distance_in_km: number;
  avg_tts_in_h: number;
  store_sub_categories: string[];
  store_name: string;
  domain: string;
  type: string;
  offers: any[];
  maxStoreItemOfferPercent: number;
}

const Render: React.FC<renderProps> = ({ storeData }) => {
  if (!storeData) return null;

  const { descriptor = {} } = storeData;

  return (
    <View>
      <Text>{descriptor?.name ?? "Unnamed Store"}</Text>
    </View>
  );
};

export const normalizeStoreData = (storeData: any): NormalizedStore => {
  const vendorIdString = storeData?.slug || storeData?.id || "";

  return {
    id: vendorIdString,
    slug: vendorIdString,
    descriptor: {
      name:
        storeData?.descriptor?.name ||
        storeData?.store_name ||
        storeData?.name ||
        "Unnamed Store",
      short_desc: storeData?.descriptor?.short_desc || "",
      description: storeData?.descriptor?.description || "",
      images: storeData?.descriptor?.images || [],
      symbol: storeData?.descriptor?.symbol || "",
    },
    symbol: storeData?.symbol || "",
    value: storeData?.value || 100,
    maxPrice: storeData?.maxPrice || 200,

    // Force 50% OFF (mock)
    discount: 50,
    calculated_max_offer: { percent: 50 },

    status: storeData?.status || "open",
    distance_in_km: storeData?.distance_in_km || 0,
    avg_tts_in_h: storeData?.avg_tts_in_h || 0.5,
    store_sub_categories: storeData?.store_sub_categories || ["Mock Category"],
    store_name:
      storeData?.store_name ||
      storeData?.descriptor?.name ||
      storeData?.name ||
      "Unnamed Store",
    domain: storeData?.domain || "ONDC:retail",
    type: storeData?.type || "store",

    // propagate offers & maxStoreItemOfferPercent
    offers: storeData?.offers || [],
    maxStoreItemOfferPercent: storeData?.maxStoreItemOfferPercent || 50,
  };
};

// Normalize HomeOfferType to work with existing components
export const normalizeOfferData = (offerData: HomeOfferType): NormalizedStore => {
  const vendorIdString = offerData?.store_id || offerData?.offer_id || "";

  return {
    id: vendorIdString,
    slug: vendorIdString,
    descriptor: {
      name: offerData?.store?.name || "Special Offer",
      short_desc: offerData?.short_desc || "",
      description: offerData?.short_desc || "",
      images: offerData?.images || [],
      symbol: offerData?.store?.symbol || "",
    },
    symbol: offerData?.store?.symbol || "",
    value: parseInt(offerData?.benefit?.value || "100"),
    maxPrice: parseInt(offerData?.qualifier?.min_value || "200"),

    // Use actual offer benefit
    discount: parseInt(offerData?.benefit?.value || "50"),
    calculated_max_offer: { 
      percent: parseInt(offerData?.benefit?.value || "50") 
    },

    status: offerData?.store_status || "open",
    distance_in_km: 1.2, // Default distance
    avg_tts_in_h: 0.5, // Default delivery time
    store_sub_categories: [offerData?.domain?.replace("ONDC:", "") || "Offer"],
    store_name: offerData?.store?.name || "Special Offer",
    domain: offerData?.domain || "ONDC:retail",
    type: "offer",

    // Convert HomeOfferType benefit to offer format
    offers: offerData?.benefit ? [{
      offer_id: offerData.offer_id || "",
      short_desc: offerData.short_desc,
      type: "discount",
      benefit: offerData.benefit,
      qualifier: offerData.qualifier,
      valid_from: "",
      valid_until: ""
    }] : [],
    maxStoreItemOfferPercent: parseInt(offerData?.benefit?.value || "50"),
  };
};

export const useRenderFunctions = () => {
  // Render function for offers carousel
  const renderOffersCarousel = (offers: HomeOfferType[]) => {
    if (!offers?.length) return null;
    return <OffersCarousel offers={offers} />;
  };

  // Render functions using the new components
  const renderCategoryItemCompact = ({
    item,
    index,
  }: {
    item: any;
    index?: number;
  }) => <CategoryItemCompact item={item} index={index} />;

  const renderOfferCard = ({ item }: { item: Store2 }) => (
    <OfferCard item={item} />
  );

  const renderRestaurantItem = ({ item }: { item: Store2 }) => (
    <RestaurantCard item={item} />
  );

  const renderStores = ({ item }: { item: Store2 }) => (
    <StoreCard item={item} />
  );

  const renderFoodCategories = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => <FoodCategoryRow item={item} index={index} />;

  const renderGroceryCategories = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => <GroceryCategoryRow item={item} index={index} />;

  return {
    renderCategoryItemCompact,
    renderOfferCard,
    renderOffersCarousel,
    renderRestaurantItem,
    renderStores,
    renderFoodCategories,
    renderGroceryCategories,
  };
};

export default Render;