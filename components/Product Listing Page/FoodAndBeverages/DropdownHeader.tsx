import React from "react";
import { ScrollView, Text, View } from "react-native";
import PLPCard from "./PLPCard";
import { CatalogItem } from "../../../state/types";

interface DropdownProps {
  isVisible: boolean;
  data: CatalogItem[];
  providerId: string;
  searchString: string;
  handleOpenPress: () => void;
  foodDetails: (data: any) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  isVisible,
  data,
  providerId,
  searchString,
  handleOpenPress,
  foodDetails,
}) => {
  const filteredData = data.filter((item) => {
    if (searchString) {
      return item?.descriptor?.name
        ?.toLowerCase()
        .includes(searchString?.toLowerCase());
    }
    return true;
  });

  return (
    <ScrollView style={{ display: isVisible ? "flex" : "none" }}>
      {filteredData.length === 0 ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "gray", fontSize: 14 }}>
            No products found in this category
          </Text>
        </View>
      ) : (
        filteredData.map((item) => (
<PLPCard
  key={item.id}
  itemName={item?.descriptor?.name}
  itemImg={item.descriptor?.images?.[0] ?? item.image ?? ""}
  shortDesc={item.descriptor.short_desc || ""}
  longDesc={item.descriptor.long_desc || ""}
  offerPrice={item.price.value}
  originalPrice={item.price.maximum_value}
  rating={4.4}
  veg={item.veg}
  id={item.id}
  providerId={providerId}
  slug={item.slug || item.id}                // ✅ fix slug
  customizable={false}
  maxLimit={item.quantity?.maximum?.count ?? 10}  // ✅ fix quantity shape
  handleOpenPress={handleOpenPress}
  foodDetails={foodDetails}
/>


        ))
      )}
    </ScrollView>
  );
};

export default Dropdown;
