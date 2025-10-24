import React, { FC, useState, useMemo } from "react";
import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import PLPFooter from "./PLPFooter";
import PLPFnBCardContainer from "./PLPFnBCardContainer";
import { useVendorData } from "@/state/useVendorData";
import { FetchProductDetail } from "@/components/search/search-products-type";

interface PLPFnBProps {
  dropdownHeaders: string[];
  vendorAddress: string;
  street: string;
  fssaiLiscenseNo: string;
  providerId: string; // This should be the FULL slug, not just the ID
  searchString: string;
  storeName?: string;
}
const PLPFnB: FC<PLPFnBProps> = ({
  dropdownHeaders,
  vendorAddress,
  street,
  fssaiLiscenseNo,
  providerId, // This is the original ObjectId
  searchString,
  storeName = "",
}) => {
  const [selectedCategory] = useState("All");

  const getFullSlug = (id: string, name: string) => {
    if (id.includes('-') && id.length > 20) {
      return id;
    }
    
    const nameSlug = name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .trim();
    
    return `${nameSlug}-${id}`;
  };

  const fullSlug = getFullSlug(providerId, storeName);

  const { data: vendorData, isLoading, error } = useVendorData(fullSlug);
  const catalog = vendorData?.catalogs || [];
  const menus = vendorData?.custom_menus || [];

const mappedItems: FetchProductDetail[] = useMemo(() => {
  if (!catalog?.length) {
    return [];
  }  
return catalog.map((item) => {
  console.log("🔍 Item:", item.descriptor?.name, {
    priceValue: item.price?.value,
    maxPrice: item.price?.maximum_value,
    offerPercent: item.price?.offerPercent,
    customizable: item.customizable,
    directlyLinked: item.directlyLinkedCustomGroupIds?.length
  });    const customMenuIds = item.custom_menu_id || [];
    const customGroupIds = item.directlyLinkedCustomGroupIds || [];  // ✅ GET FROM MAPPED ITEM

    return {
      symbol: item.descriptor?.symbol || `item-${item.id}`,
      store_status: "open",
      rating: 0,
      customizable: item.customizable || false,
      custom_menu_id: customMenuIds,
      directlyLinkedCustomGroupIds: customGroupIds,  // ✅ PASS IT THROUGH
    price: {
  value: item.price?.value ?? 0,  // ✅ Works
  maximum_value: item.price?.maximum_value ?? 0,  // ✅ Works
  offerPercent: item.price?.offerPercent ?? 0,  // ✅ Works
  currency: "INR"
},
      name: item.descriptor?.name || "Unnamed Item",
      short_desc: item.descriptor?.short_desc || "",
      images: item.descriptor?.images || [],
      category_id: item.category_id || "",
      diet_type: item.veg ? "veg" : item.non_veg ? "non_veg" : "veg",
      store_id: providerId,
      catalog_id: item.catalog_id || "",
      slug: item.id || `slug-${item.catalog_id}`,
      instock: true,
      status: "active",
      vendor_id: providerId,
      domain: "fnb",
      quantity: item.quantity?.available?.count || 0,
      location_id: item.location_id || "",
      store_status_timestamp: new Date().toISOString(),
      provider_status: "active",
      provider_status_timestamp: new Date().toISOString(),
      type: "food"
    };
  });
  
}, [catalog, providerId]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#d12a2a" />
        <Text style={{ marginTop: 10 }}>Loading menu...</Text>
      </View>
    );
  }

  // Show error state with more details
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 }}>
        <Text style={{ color: "red", fontSize: 16, fontWeight: "bold" }}>Error loading store data</Text>
        <Text style={{ color: "#666", marginTop: 10, textAlign: "center" }}>
          Could not load store details. Please check the store ID.
        </Text>
        <Text style={{ color: "#999", marginTop: 5, fontSize: 12 }}>
          ID: {providerId}
        </Text>
        <Text style={{ color: "#999", marginTop: 5, fontSize: 12 }}>
          Slug: {fullSlug}
        </Text>
      </View>
    );
  }

  // Show empty state if no data
  if (!vendorData || catalog.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 16 }}>No menu items available</Text>
        <Text style={{ color: "#666", marginTop: 5 }}>Please check back later</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <PLPFnBCardContainer
        items={mappedItems}
        menus={menus}
        selectedCategory={selectedCategory}
        searchString={searchString}
        storeId={providerId} // ✅ Pass the original ObjectId, not the slug
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