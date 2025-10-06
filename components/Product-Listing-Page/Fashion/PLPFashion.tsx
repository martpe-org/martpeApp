import { FC, useState } from "react";
import { View } from "react-native";
import FashionCategories from "./FashionCategories";
import PLPCardContainer from "./PLPCardContainer";

interface PLPFashionProps {
  catalog: any[];
  headers: string[];
  storeId?: string; // Make optional since we're not using it anymore
}

const PLPFashion: FC<PLPFashionProps> = ({ catalog, headers }) => {
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
      />
    </View>
  );
};

export default PLPFashion;