import React from "react";
import { ScrollView, Text, View } from "react-native";
import PLPCard from "./PLPCard";

interface Descriptor {
  images: string[];
  name: string;
  symbol: string;
  short_desc:string;
  long_desc:string;
}

interface Price {
  maximum_value: number;
  offer_percent: number | null;
  offer_value: number | null;
  value: number;
}

interface Quantity {
  maximum: {
    count: number;
  };
  available: {
    count: number;
  };
}

interface CatalogItem {
  bpp_id: string;
  bpp_uri: string;
  catalog_id: string;
  category_id: string;
  descriptor: Descriptor;
  id: string;
  location_id: string;
  non_veg: boolean | null;
  price: Price;
  provider_id: string;
  veg: boolean;
  provider: {
    id: string;
  };
  quantity: Quantity;
}

interface DropdownProps {
  isVisible: boolean;
  data: CatalogItem[];
  providerId: string;
  searchString: string;
  handleOpenPress: () => void;   // ✅ fixed name
  foodDetails: (data: any) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  isVisible,
  data,
  providerId,
  searchString,
  handleOpenPress,   // ✅ destructure correctly
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
            key={item.id} // ✅ unique stable key
            itemName={item?.descriptor?.name}
            itemImg={item.descriptor.images[0]}
            shortDesc={item.descriptor.short_desc}
            longDesc={item.descriptor.long_desc}
            offerPrice={item.price.value}
            originalPrice={item.price.maximum_value}
            rating={4.4}
            veg={item.veg}
            id={item.id}
            providerId={providerId}
            slug={item.provider.id}
            customizable={false}
            maxLimit={Math.min(
              item.quantity.maximum.count,
              item.quantity.available.count
            )}
            handleOpenPress={handleOpenPress}  // ✅ consistent
            foodDetails={foodDetails}
          />
        ))
      )}
    </ScrollView>
  );
};

export default Dropdown;
