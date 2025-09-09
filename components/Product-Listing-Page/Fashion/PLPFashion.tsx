import { FC, useState, useMemo, useCallback } from "react";
import { View } from "react-native";
import FashionCategories from "./FashionCategories";
import PLPCardContainer from "./PLPCardContainer";

interface PLPFashionProps {
  catalog: any[];
  headers: string[];
  storeId?: string;
  storeName?: string;
}

const PLPFashion: FC<PLPFashionProps> = ({ 
  catalog, 
  headers, 
  storeId,
  storeName 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Memoize the catalog to prevent unnecessary re-processing
  const memoizedCatalog = useMemo(() => catalog, [catalog]);

  // Use useCallback to prevent unnecessary re-renders of child components
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <FashionCategories 
        onCategorySelect={handleCategorySelect}
        activeCategory={selectedCategory}
      />
      <PLPCardContainer
        domainColor="#f6fafa"
        catalog={memoizedCatalog}
        selectedCategory={selectedCategory}
        storeId={storeId}
      />
    </View>
  );
};

export default PLPFashion;