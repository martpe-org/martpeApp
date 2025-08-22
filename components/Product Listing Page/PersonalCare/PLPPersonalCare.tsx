import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import HorizontalNavbar from "../Grocery/HorizontalNavbar";
import PersonalCareCardContainer from "./PersonalCareCardContainer";

interface CatalogItem {
  catalog_id: string;
  category_id: string;
  descriptor: {
    images: string[];
    long_desc: string;
    name: string;
    short_desc: string;
    symbol: string;
  };
  id: string;
  price: {
    maximum_value: number;
    value: number;
  };
  provider_id: string;
}

interface PLPPersonalCareProps {
  catalog: CatalogItem[];
  sidebarTitles: string[];
  providerId: string | string[];
  searchString: string;
}

const PLPPersonalCare: React.FC<PLPPersonalCareProps> = ({
  catalog,
  sidebarTitles,
  providerId,
  searchString,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Filter catalog based on selected category
  const filteredCatalog =
    selectedCategory === "All"
      ? catalog
      : catalog.filter((item) => item.category_id === selectedCategory);

  // Animate "No Items"
  useEffect(() => {
    if (filteredCatalog.length === 0 && selectedCategory !== "All") {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [filteredCatalog, selectedCategory]);

  // Default buttons in case sidebarTitles is empty
  const defaultButtons = [
    "All",
    "Bath & Body",
    "Feminine Care",
    "Fragrance",
    "Hair Care",
    "Oral Care",
    "Make Up",
    "Skin Care",
  ];

  // Animated "No Items" Display
  const NoItemsDisplay = () => (
    <Animated.View
      style={[
        styles.noItemsContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.noItemsEmoji}>🧴</Text>
      <Text style={styles.noItemsTitle}>No Products Found</Text>
      <Text style={styles.noItemsSubtext}>
        Nothing available in <Text style={{ fontWeight: "bold" }}>{selectedCategory}</Text>
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <HorizontalNavbar
        navbarTitles={sidebarTitles.length ? sidebarTitles : defaultButtons}
        domainColor="rgba(255, 211, 237, 1)"
        onFilterSelect={handleCategorySelect}
        activeCategory={selectedCategory}
      />

      {/* Cards */}
      <PersonalCareCardContainer
        searchString={searchString}
        providerId={providerId}
        catalog={filteredCatalog} // ✅ pass filtered catalog
        selectedCategory={selectedCategory}
      />

      {/* Show "No items" when nothing matches */}
      {selectedCategory !== "All" && filteredCatalog.length === 0 && <NoItemsDisplay />}
    </View>
  );
};

export default PLPPersonalCare;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noItemsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  noItemsEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  noItemsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  noItemsSubtext: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
  },
});
