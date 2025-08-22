import { FC, useState } from "react";
import { View } from "react-native";
import FashionCategories from "./FashionCategories";
import PLPCardContainer from "./PLPCardContainer";

interface PLPFashionProps {
  catalog: any[];
  headers: string[];
  storeId: string;
}

const PLPFashion: FC<PLPFashionProps> = ({ catalog, headers, storeId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <FashionCategories 
        onCategorySelect={handleCategorySelect}
        activeCategory={selectedCategory}
      />
      <PLPCardContainer
        domainColor="rgba(163, 251, 251, 1)"
        catalog={catalog}
        selectedCategory={selectedCategory}
        storeId={storeId}
      />
    </View>
  );
};

export default PLPFashion;