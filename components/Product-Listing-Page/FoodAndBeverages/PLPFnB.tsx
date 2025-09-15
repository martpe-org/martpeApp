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
  catalog = [], // ✅ fallback to empty array
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
  if (!catalog || catalog.length === 0) return ["All"]; // ✅ safe guard
  const uniqueCategories = Array.from(
    new Set(catalog.map((item) => item.category_id).filter(Boolean))
  );
  return ["All", ...uniqueCategories];
}, [catalog]);


const fnbCatalog = useMemo(() => {
  if (!catalog) return [];
  return catalog.map(item => ({
    ...item,
    catalog_id: item.catalog_id || "",
    store_id: item.store_id || providerId,
    weight: "1 serving",
    unit: "plate",
  }));
}, [catalog, providerId]);


  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ Veg/Non-Veg Filter Tabs */}
<HeaderTabs
  buttonTitles={["All", "Veg", "Non-Veg"]}
  onFilterChange={(tab) => setVegFilter(tab as "All" | "Veg" | "Non-Veg")}
/>

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
