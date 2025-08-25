import { FC, useState, useMemo } from "react";
import { View, ScrollView } from "react-native";
import HeaderTabs from "./HeaderTabs";
import DropdownHeader from "./DropdownHeader";
import PLPFooter from "./PLPFooter";

interface Descriptor {
  images: string[];
  name: string;
  symbol: string;
}

interface CatalogItem {
  veg: boolean;
  non_veg: boolean | null;
  // ...other props
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
}) => {
  const [filter, setFilter] = useState<string>("All");

  // ✅ Filter catalog based on Veg / Non-Veg
  const filteredCatalog = useMemo(() => {
    if (filter === "Veg") return catalog.filter((item) => item.veg);
    if (filter === "Non-Veg") return catalog.filter((item) => item.non_veg);
    return catalog;
  }, [filter, catalog]);

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      {/* Veg / Non-Veg filter tabs */}
      <HeaderTabs buttonTitles={buttonTitles} onFilterChange={setFilter} />

      {/* Catalog cards */}
      <DropdownHeader
        dropdownHeaders={dropdownHeaders}
        dropdownData={filteredCatalog as any}
        providerId={providerId}
        handleOpenPress={handleOpenPress}
        foodDetails={foodDetails}
        searchString={searchString}
      />

      {/* Footer */}
      <PLPFooter
        vendorName={descriptor.name}
        outletLocation={street}
        vendorAddress={vendorAddress}
        fssaiLiscenseNo={fssaiLiscenseNo}
      />
    </View>
  );
};

export default PLPFnB;
