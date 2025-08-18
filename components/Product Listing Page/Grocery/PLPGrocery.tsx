import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import HorizontalNavbar from "./HorizontalNavbar";
import GroceryCardContainer from "./GroceryCardContainer";

// Define the interface locally to avoid circular dependency
interface CatalogItem {
  id: string;
  category_id: string;
  descriptor: {
    images: string[];
    name: string;
  };
  price: {
    value: number;
  };
  quantity: {
    maximum: { count: number };
    available: { count: number };
  };
}

interface PLPGroceryProps {
  providerId: string;
  searchString: string;
  sidebarTitles: string[];
  catalog: CatalogItem[];
}

const PLPGrocery: React.FC<PLPGroceryProps> = ({
  sidebarTitles,
  catalog,
  providerId,
  searchString,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleFilterSelect = (title: string) => {
    console.log('Filter selected:', title);
    setSelectedCategory(title);
  };

  return (
    <View style={styles.container}>
      <HorizontalNavbar
        navbarTitles={sidebarTitles}
        onFilterSelect={handleFilterSelect}
      />
      <GroceryCardContainer
        catalog={catalog}
        selectedCategory={selectedCategory}
        providerId={providerId}
        searchString={searchString}
      />
    </View>
  );
};

export default PLPGrocery;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
});