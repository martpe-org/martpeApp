import React, { useState, useEffect, useRef, useMemo } from "react";
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
    symbol?: string;
  };
  id: string;
  price: {
    maximum_value: number;
    value: number;
  };
  provider_id: string;
  provider?: { store_id: string };
  store?: { _id: string; name?: string; slug?: string; symbol?: string };
  slug?: string;
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

  // Enhanced filter logic with proper validation
  const filteredCatalog = useMemo(() => {
    let items = catalog || [];
    
    // Filter by category
    if (selectedCategory && selectedCategory !== "All") {
      items = items.filter((item) => item.category_id === selectedCategory);
    }

    // Filter by search string
    if (searchString && searchString.trim() !== "") {
      items = items.filter((item) =>
        item?.descriptor?.name?.toLowerCase().includes(searchString.toLowerCase().trim())
      );
    }

    return items;
  }, [catalog, selectedCategory, searchString]);

  // Animate "No Items" with proper conditions
  useEffect(() => {
    const shouldShowNoItems = filteredCatalog.length === 0 &&
      selectedCategory !== "All" &&
      catalog.length > 0;
      
    if (shouldShowNoItems) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filteredCatalog.length, selectedCategory, catalog.length]);

  // Enhanced navbar buttons using local assets (like other components)
  const getNavbarButtons = () => {
    if (sidebarTitles && sidebarTitles.length > 0) {
      return sidebarTitles.map((title) => ({
        title,
        image: undefined, // Let HorizontalNavbar handle fallback
      }));
    }

    // Default personal care categories using local image assets
    return [
      {
        title: "All",
        image: require("../../../assets/headerImage1.png"), // Reuse existing asset
      },
      {
        title: "Bath & Body",
        image: require("../../../assets/headerImage2.png"), // Reuse existing asset
      },
      {
        title: "Feminine Care",
        image: require("../../../assets/headerImage3.png"), // Reuse existing asset
      },
      {
        title: "Fragrance",
        image: require("../../../assets/headerImage4.png"), // Reuse existing asset
      },
      {
        title: "Hair Care",
        image: require("../../../assets/headerImage5.png"), // Reuse existing asset
      },
      {
        title: "Oral Care",
        image: require("../../../assets/headerImage6.png"), // Reuse existing asset
      },
      {
        title: "Make Up",
        image: require("../../../assets/headerImage1.png"), // Reuse existing asset
      },
      {
        title: "Skin Care",
        image: require("../../../assets/headerImage2.png"), // Reuse existing asset
      },
    ];
  };

  const navbarButtons = getNavbarButtons();

  return (
    <View style={styles.container}>
      {/* Enhanced HorizontalNavbar with hasProducts prop */}
      <HorizontalNavbar
        domainColor="#9b59b6" // Purple color for personal care
        navbarTitles={navbarButtons}
        onFilterSelect={setSelectedCategory}
        activeCategory={selectedCategory}
        hasProducts={filteredCatalog.length > 0}
      />

      {/* Always render container, even if empty */}
      <PersonalCareCardContainer
        catalog={filteredCatalog}
        domainColor="rgba(155, 89, 182, red(1)" // Purple color
        selectedCategory={selectedCategory}
        storeId={typeof providerId === 'string' ? providerId : providerId[0]}
      />

      {/* Enhanced "No items" display with better conditions */}
      {selectedCategory !== "All" &&
        filteredCatalog.length === 0 &&
        catalog.length > 0 && (
          <Animated.View
            style={[
              styles.noItemsContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.noItemsEmoji}>🔍</Text>
            <Text style={styles.noItemsTitle}>No Products Found</Text>
            <Text style={styles.noItemsSubtext}>
              Nothing available in{" "}
              <Text style={{ fontWeight: "600" }}>{selectedCategory}</Text>
            </Text>
            {searchString && (
              <Text style={styles.searchHint}>
                Try searching for {searchString} in other categories
              </Text>
            )}
          </Animated.View>
        )}

      {/* Show message when no catalog data at all */}
      {(!catalog || catalog.length === 0) && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noItemsEmoji}>📦</Text>
          <Text style={styles.noItemsTitle}>No Catalog Data</Text>
          <Text style={styles.noItemsSubtext}>
            Personal care products will appear here when available
          </Text>
        </View>
      )}
    </View>
  );
};

export default PLPPersonalCare;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  noItemsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
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
    textAlign: "center",
  },
  noItemsSubtext: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 8,
  },
  searchHint: {
    fontSize: 12,
    color: "#9b59b6", // Match domain color
    textAlign: "center",
    fontStyle: "italic",
  },
});
