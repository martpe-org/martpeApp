// PLPFnB.tsx
import { FC, useState, useMemo } from "react";
import { ScrollView } from "react-native";import PLPFooter from "./PLPFooter";
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
  catalog = [],
  dropdownHeaders,
  vendorAddress,
  street,
  fssaiLiscenseNo,
  providerId,
  searchString,
  storeName = "",
}) => {
  const [selectedCategory] = useState("All");

  const fnbCatalog = useMemo(() => {
    if (!catalog) return [];
    return catalog.map((item) => ({
      ...item,
      catalog_id: item.catalog_id || "",
      store_id: item.store_id || providerId,
      weight: "1 serving",
      unit: "plate",
    }));
  }, [catalog, providerId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ F&B Card Container */}
      <PLPFnBCardContainer
        catalog={fnbCatalog}
        selectedCategory={selectedCategory}
        searchString={searchString}
        storeId={providerId}
        storeName={storeName}
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