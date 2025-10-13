import { FC, useState, useMemo } from "react";
import { ScrollView } from "react-native";
import PLPFooter from "./PLPFooter";
import PLPFnBCardContainer from "./PLPFnBCardContainer";
import { ComponentCatalogItem } from "@/state/useVendorData";
import { StoreItem } from "@/components/store/fetch-store-items-type";

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

  // 🧠 Convert ComponentCatalogItem → StoreItem (for RN UI)
  const mappedItems: StoreItem[] = useMemo(() => {
    if (!catalog) return [];

    return catalog.map((item) => ({
      symbol: item.descriptor?.symbol || item.id || "",
      store_status: "open",
      rating: 0,
      customizable: item.customizable ?? false,
      type: "food",
      unitized: {
        measure: { value: 1, unit: "plate" },
      },
      location_id: item.location_id || "",
      category_id: item.category_id || "",
      price: {
        value: item.price?.value || 0,
        maximum_value: item.price?.maximum_value || 0,
        offerPercent: item.price?.offer_percent || 0,
      },
      slug: item.id || item.catalog_id || "",
      tts_in_h: 0.5,
      store_id: item.store_id || providerId,
      images: item.descriptor?.images || [],
      quantity: item.quantity?.available?.count || 0,
      custom_menu_id: item.customizations || [],
      diet_type: item.veg
        ? "Veg"
        : item.non_veg
        ? "Non-Veg"
        : undefined,
      recommended: false,
      provider_status_timestamp: new Date().toISOString(),
      catalog_id: item.catalog_id || "",
      store_status_timestamp: new Date().toISOString(),
      provider_status: "active",
      vendor_id: providerId,
      domain: "fnb",
      name: item.descriptor?.name || "Unnamed Item",
      provider_id: providerId,
      short_desc: item.descriptor?.short_desc || "",
      // ✅ Use category title from backend if present
      category: item.category || item.category_name || "Others",
      status: "active",
      instock: true,
    }));
  }, [catalog, providerId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ Grouped Card Container */}
      <PLPFnBCardContainer
        items={mappedItems}
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
