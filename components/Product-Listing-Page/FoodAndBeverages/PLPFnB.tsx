import { FC, useState, useMemo } from "react";
import {  ScrollView } from "react-native";
import HeaderTabs from "./HeaderTabs";
import HorizontalNavbar from "../Grocery/HorizontalNavbar";
import PLPFooter from "./PLPFooter";
import PLPFnBCardContainer from "./PLPFnBCardContainer";
import { ComponentCatalogItem } from "@/state/useVendorData";

interface PLPFnBProps {
  catalog: ComponentCatalogItem[];
  dropdownHeaders: string[];
  vendorAddress: string;
  street: string;
  fssaiLiscenseNo: string;
  providerId: string;
  searchString: string;
  storeName?: string;
}

const PLPFnB: FC<PLPFnBProps> = ({
  catalog,
  dropdownHeaders,
  vendorAddress,
  street,
  fssaiLiscenseNo,
  providerId,
  searchString,
  storeName = "",
}) => {
  const [vegFilter, setVegFilter] = useState<"All" | "Veg" | "Non-Veg">("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ Get unique categories from catalog
  const availableCategories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(catalog.map((item) => item.category_id).filter(Boolean))
    );
    return ["All", ...uniqueCategories];
  }, [catalog]);

  // ✅ Convert ComponentCatalogItem to FnBCatalogItem format
  const fnbCatalog = useMemo(() => {
    return catalog.map(item => ({
      ...item,
      catalog_id: item.catalog_id || "",
      store_id: item.store_id || providerId,
      weight: "1 serving", // Default for F&B
      unit: "plate", // Default for F&B
    }));
  }, [catalog, providerId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ Veg/Non-Veg Filter Tabs */}
      <HeaderTabs 
        filter={vegFilter} 
        setFilter={setVegFilter}
        vegCount={catalog.filter(item => item.veg).length}
        nonVegCount={catalog.filter(item => item.non_veg).length}
      />

      {/* ✅ Category Navigation */}
      {availableCategories.length > 1 && (
        <HorizontalNavbar
          navbarTitles={availableCategories}
          onFilterSelect={setSelectedCategory}
          activeCategory={selectedCategory}
          domainColor="#f14343" // F&B theme color
        />
      )}

      {/* ✅ F&B Card Container */}
      <PLPFnBCardContainer
        catalog={fnbCatalog}
        selectedCategory={selectedCategory}
        searchString={searchString}
        storeId={providerId}
        storeName={storeName}
        vegFilter={vegFilter}
      />

      {/* ✅ Footer */}
      <PLPFooter
        vendorName={storeName}
        outletLocation={street}
        vendorAddress={vendorAddress}
        fssaiLiscenseNo={fssaiLiscenseNo}
      />
    </ScrollView>
  );
};

export default PLPFnB;
