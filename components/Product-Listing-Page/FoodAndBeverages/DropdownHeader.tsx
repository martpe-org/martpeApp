import React from "react";
import { ScrollView, Text, View } from "react-native";
import PLPCard from "./PLPCard";
import { CatalogItem } from "../../common/types";

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
  // ✅ Enhanced filtering with null safety
  const filteredData = data?.filter((item) => {
    if (!item) return false;
    
    if (searchString && searchString.trim() !== "") {
      const itemName = item?.descriptor?.name || "";
      return itemName.toLowerCase().includes(searchString.toLowerCase());
    }
    return true;
  }) || [];

  return (
    <ScrollView 
      style={{ 
        display: isVisible ? "flex" : "none",
        backgroundColor: "#fff",
      }}
      showsVerticalScrollIndicator={false}
    >
      {filteredData.length === 0 ? (
        <View style={{ 
          padding: 30, 
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}>
          <Text style={{ 
            color: "#999", 
            fontSize: 16,
            textAlign: "center",
            fontWeight: "500",
          }}>
            {searchString 
              ? `No items found for "${searchString}"` 
              : "No products found in this category"
            }
          </Text>
        </View>
      ) : (
        filteredData.map((item, index) => {
          if (!item) return null;

          // ✅ Enhanced image source resolution
          const getImageSource = () => {
            const images = item.descriptor?.images;
            if (images && images.length > 0 && images[0].trim() !== "") {
              return images[0];
            }
            if (item.image && item.image.trim() !== "") {
              return item.image;
            }
            if (item.descriptor?.symbol && item.descriptor.symbol.trim() !== "") {
              return item.descriptor.symbol;
            }
            return "";
          };

          return (
            <PLPCard
              key={`${item.id}-${index}-${item.descriptor?.name?.slice(0,10) || 'item'}`}
              itemName={item?.descriptor?.name || "Unnamed Item"}
              itemImg={getImageSource()}
              shortDesc={item.descriptor?.short_desc || ""}
              longDesc={item.descriptor?.long_desc || ""}
              offerPrice={item.price.value}
              originalPrice={item.price.maximum_value || item.price.value}
              rating={4.4}
              veg={item.veg || false}
              id={item.id}
              providerId={providerId}
              slug={item.provider?.id || item.slug || providerId}
              customizable={item.customizable || false}
              maxLimit={item.quantity || 10}
              handleOpenPress={handleOpenPress}
              foodDetails={foodDetails}
            />
          );
        })
      )}
    </ScrollView>
  );
};

export default Dropdown;