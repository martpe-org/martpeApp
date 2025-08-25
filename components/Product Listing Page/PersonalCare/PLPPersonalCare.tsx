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
    symbol?: string; // ✅ Add symbol field
  };
  id: string;
  price: {
    maximum_value: number;
    value: number;
  };
  provider_id: string;
  provider?: { store_id: string };
  store?: { _id: string; name?: string; slug?: string; symbol?: string }; // ✅ Add store field
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

  // ✅ Enhanced filter logic with proper validation
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

  // ✅ Animate "No Items" with proper conditions
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

  // ✅ Enhanced default buttons with images (like HorizontalNavbar)
  const getNavbarButtons = () => {
    if (sidebarTitles && sidebarTitles.length > 0) {
      return sidebarTitles.map((title) => ({
        title,
        image: undefined, // Will use placeholder in HorizontalNavbar
      }));
    }

    // Default personal care categories with placeholder images
    return [
      { title: "All", image: undefined },
      { title: "Bath & Body", image: undefined },
      { title: "Feminine Care", image: undefined },
      { title: "Fragrance", image: undefined },
      { title: "Hair Care", image: undefined },
      { title: "Oral Care", image: undefined },
      { title: "Make Up", image: undefined },
      { title: "Skin Care", image: undefined },
    ];
  };

  const navbarButtons = getNavbarButtons();

  return (
    <View style={styles.container}>
      {/* ✅ Enhanced HorizontalNavbar with hasProducts prop */}
      <HorizontalNavbar
        navbarTitles={navbarButtons}
        domainColor="#530633"
        onFilterSelect={setSelectedCategory}
        activeCategory={selectedCategory}
        hasProducts={filteredCatalog.length > 0}
      />

      {/* ✅ Always render container, even if empty */}
      <PersonalCareCardContainer
        searchString={searchString}
        providerId={providerId}
        catalog={filteredCatalog}
        selectedCategory={selectedCategory}
      />

      {/* ✅ Enhanced "No items" display with better conditions */}
      {selectedCategory !== "All" && 
       filteredCatalog.length === 0 && 
       catalog.length > 0 && (
        <Animated.View
          style={[
            styles.noItemsContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.noItemsEmoji}>🧴</Text>
          <Text style={styles.noItemsTitle}>No Products Found</Text>
          <Text style={styles.noItemsSubtext}>
            Nothing available in{" "}
            <Text style={{ fontWeight: "bold", color: "#530633" }}>
              {selectedCategory}
            </Text>
          </Text>
          {searchString && (
            <Text style={styles.searchHint}>
              Try searching for {searchString} in other categories
            </Text>
          )}
        </Animated.View>
      )}

      {/* ✅ Show message when no catalog data at all */}
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
    color: "#530633",
    textAlign: "center",
    fontStyle: "italic",
  },
});