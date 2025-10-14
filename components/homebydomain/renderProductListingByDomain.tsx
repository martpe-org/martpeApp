import React from "react";
import { Text, StyleSheet } from "react-native";
import GroceryCardContainer from "@/components/Product-Listing-Page/Grocery/GroceryCardContainer";
import PLPElectronics from "../Product-Listing-Page/Electronics/PLPElectronics";
import PLPFashion from "../Product-Listing-Page/Fashion/PLPFashion";
import PLPHomeAndDecor from "../Product-Listing-Page/HomeAndDecor/PLPHomeAndDecor";
import PLPPersonalCare from "../Product-Listing-Page/PersonalCare/PLPPersonalCare";
import { ComponentCatalogItem, VendorData } from "@/state/useVendorData";
import PLPFnB from "../Product-Listing-Page/FoodAndBeverages/PLPFnB";

interface PLPComponentsProps {
  vendorData: VendorData;
  allItems: ComponentCatalogItem[];
  dropdownHeaders: string[];
  searchString: string;
  vendorSlug: string;
}

// Component selector based on domain
export const renderProductListingByDomain = ({
  vendorData,
  allItems,
  dropdownHeaders,
  searchString,
}: PLPComponentsProps) => {
  const { domain, _id: storeId, descriptor } = vendorData;
  const storeName = descriptor?.name || "";

  switch (domain) {
    case "ONDC:RET10": // Grocery
      return (
        <GroceryCardContainer
          catalog={allItems}
          searchString={searchString}
          storeId={storeId}
          storeName={storeName}
        />
      );

case "ONDC:RET11": // Food and Beverage
  return (
    <PLPFnB
      catalog={allItems || []} // ✅ force fallback
      dropdownHeaders={dropdownHeaders || []}
      vendorAddress={vendorData.address?.street || ""}
      street={vendorData.address?.locality || ""}
      fssaiLiscenseNo=""
      providerId={storeId}
      searchString={searchString || ""}
      storeName={storeName}
    />
  );
    case "ONDC:RET12": // Fashion
      return (
        <PLPFashion
          headers={dropdownHeaders}
          catalog={allItems}
          storeId={storeId}
        />
      );

    case "ONDC:RET13": // Personal Care
      return (
        <PLPPersonalCare
          providerId={storeId}
          catalog={allItems}
          sidebarTitles={dropdownHeaders}
          searchString={searchString}
        />
      );

    case "ONDC:RET14": // Electronics
      return (
        <PLPElectronics
          catalog={allItems}
          sidebarTitles={dropdownHeaders}
          searchString={searchString}
          storeId={storeId}
          storeName={storeName}
        />
      );

    case "ONDC:RET16": // Home & Decor
      return (
        <PLPHomeAndDecor
          catalog={allItems}
          storeId={storeId}
          storeName={storeName}
          provider={storeId}
        />
      );

    default:
      return (
        <Text style={styles.invalidDomainText}>Unsupported store type</Text>
      );
  }
};

// Helper to compute vendor info
export const computeVendorInfo = (
  vendorData: VendorData,
  allItems: ComponentCatalogItem[]
) => {
  const { locality, street, city, state, area_code } =
    vendorData?.address || {};

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

  // Deduplicate dropdown headers
  const dropdownHeaders = Array.from(
    new Set(allItems.map((item) => item.category_id || "").filter(Boolean))
  );

  return { vendorAddress, storeCategories, dropdownHeaders };
};

// Serviceability check helper
export const checkServiceability = (
  vendorData: VendorData | null,
  selectedCity?: string
) => {
  if (!vendorData) return false;

  const safeNormalize = (val?: string) =>
    typeof val === "string" ? val.toLowerCase().trim() : "";

  const panIndia = !!vendorData?.panIndia;
  const normalizedSelectedCity = safeNormalize(selectedCity);
  const vendorCity = safeNormalize(vendorData?.address?.city);

  return (
    panIndia ||
    (!!normalizedSelectedCity && normalizedSelectedCity === vendorCity)
  );
};

const styles = StyleSheet.create({
  invalidDomainText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});