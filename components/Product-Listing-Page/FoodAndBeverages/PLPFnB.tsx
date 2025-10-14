import React, { FC, useState, useMemo } from "react";
import { ScrollView } from "react-native";
import PLPFooter from "./PLPFooter";
import PLPFnBCardContainer from "./PLPFnBCardContainer";
import { StoreItem } from "@/components/store/fetch-store-items-type";
import { useVendorData, ComponentCatalogItem } from "@/state/useVendorData"; // ✅ Import useVendorData

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

  // ✅ Use useVendorData instead of useStoreDetails to get custom_menus
  const { data: vendorData } = useVendorData(providerId);

  // ✅ Now custom_menus will be available
  const menus = vendorData?.custom_menus || [];
  console.log("🧠 Final menus passed to PLPFnBCardContainer:", menus.length);

  const mappedItems: StoreItem[] = useMemo(() => {
    if (!catalog?.length) return [];

    return catalog.map((item) => {
      // Find matching menu by name
      const matchedMenu = vendorData?.custom_menus?.find((m) =>
        item.descriptor?.name?.toLowerCase().includes(m.name.toLowerCase())
      );

      // Assign custom_menu_id array
      const customMenuIds = matchedMenu ? [matchedMenu.custom_menu_id] : [];

      return {
        symbol: item.descriptor?.symbol || "",
        store_status: "open",
        rating: 0,
        customizable: false,
        custom_menu_id: customMenuIds,
        price: {
          value: item.price?.value ?? 0,
          maximum_value: item.price?.maximum_value ?? 0,
          offerPercent: item.price?.offer_percent ?? 0,
        },
        name: item.descriptor?.name || "Unnamed Item",
        short_desc: item.descriptor?.short_desc || "",
        images: item.descriptor?.images || [],
        category_id: item.category_id || "",
        diet_type: item.veg ? "veg" : item.non_veg ? "non_veg" : undefined,
        store_id: providerId,
        catalog_id: item.catalog_id || "",
        slug: item.id || item.catalog_id || "",
        instock: true,
        status: "active",
        vendor_id: providerId,
        domain: "fnb",
      };
    });
  }, [catalog, providerId, vendorData?.custom_menus]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <PLPFnBCardContainer
        items={mappedItems}
        menus={menus}
        selectedCategory={selectedCategory}
        searchString={searchString}
        storeId={providerId}
        storeName={storeName}
      />
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