import { FC, useState, useMemo } from "react";
import { View, ScrollView } from "react-native";
import HeaderTabs from "./HeaderTabs";
import DropdownHeader from "./DropdownHeader";
import PLPFooter from "./PLPFooter";
import HorizontalNavbar from "../Grocery/HorizontalNavbar";

interface Descriptor {
  images: string[];
  name: string;
  symbol: string;
}

interface CatalogItem {
  id: string;
  veg: boolean;
  non_veg: boolean | null;
  descriptor?: {
    name?: string;
    short_desc?: string;
    long_desc?: string;
    images?: string[];
    symbol?: string;
  };
  price: {
    value: number;
    maximum_value?: number;
  };
  category_id?: string;
  slug?: string;
  customizable?: boolean;
  quantity?: number;
  image?: string;
}

interface PLPFnBProps {
  descriptor: Descriptor;
  catalog: CatalogItem[];
  dropdownHeaders: string[];
  vendorAddress: string;
  buttonTitles: string[];
  street: string;
  fssaiLiscenseNo: string;
  providerId: string;
  handleOpenPress: () => void;
  searchString: string;
  foodDetails: (data: any) => void;
  // ✅ New optional props for enhanced functionality
  categories?: string[];
  displayMode?: "dropdown" | "cards"; // Toggle between old and new display
}

const PLPFnB: FC<PLPFnBProps> = ({
  descriptor,
  catalog,
  dropdownHeaders,
  vendorAddress,
  buttonTitles,
  street,
  fssaiLiscenseNo,
  providerId,
  handleOpenPress,
  foodDetails,
  searchString,
  categories = [],
  displayMode = "cards", // ✅ Default to new card layout
}) => {
  const [filter, setFilter] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // ✅ Filter catalog based on Veg / Non-Veg
  const filteredCatalog = useMemo(() => {
    if (filter === "Veg") return catalog.filter((item) => item.veg);
    if (filter === "Non-Veg") return catalog.filter((item) => item.non_veg);
    return catalog;
  }, [filter, catalog]);

  // ✅ Get unique categories from catalog if not provided
  const availableCategories = useMemo(() => {
    if (categories.length > 0) return ["All", ...categories];
    
    const uniqueCategories = Array.from(
      new Set(catalog.map((item) => item.category_id).filter(Boolean))
    );
    return ["All", ...uniqueCategories];
  }, [catalog, categories]);

  // ✅ Check if current selection has products
  const hasProducts = useMemo(() => {
    const categoryFiltered = selectedCategory === "All" 
      ? filteredCatalog 
      : filteredCatalog.filter((item) => item.category_id === selectedCategory);
    
    return categoryFiltered.length > 0;
  }, [filteredCatalog, selectedCategory]);

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      {/* Veg / Non-Veg filter tabs */}
      <HeaderTabs buttonTitles={buttonTitles} onFilterChange={setFilter} />

      {/* ✅ Conditional rendering based on display mode */}
      {displayMode === "cards" ? (
        <>
          {/* Category navigation for card mode */}
          {availableCategories.length > 1 && (
            <HorizontalNavbar
              domainColor="#1DA578"
              navbarTitles={availableCategories}
              onFilterSelect={setSelectedCategory}
              activeCategory={selectedCategory}
              hasProducts={hasProducts}
            />
          )}
        </>
      ) : (
        <>
          {/* Original dropdown mode */}
          <DropdownHeader
            dropdownHeaders={dropdownHeaders}
            dropdownData={filteredCatalog as any}
            providerId={providerId}
            handleOpenPress={handleOpenPress}
            foodDetails={foodDetails}
            searchString={searchString}
          />
        </>
      )}

      {/* Footer */}
      <PLPFooter
        vendorName={descriptor.name}
        outletLocation={street}
        vendorAddress={vendorAddress}
        fssaiLiscenseNo={fssaiLiscenseNo}
      />
    </View>
  );}