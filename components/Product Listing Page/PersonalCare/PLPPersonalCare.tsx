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

  // Define tabs
  const buttons = [
    { title: "All" },
    { title: "Bath & Body", image: require("../../../assets/bpcHeaderImage1.png") },
    { title: "Feminine Care", image: require("../../../assets/bpcHeaderImage2.png") },
    { title: "Fragnance", image: require("../../../assets/bpcHeaderImage3.png") },
    { title: "Hair Care", image: require("../../../assets/bpcHeaderImage4.png") },
    { title: "Oral Care", image: require("../../../assets/bpcHeaderImage5.png") },
    { title: "Make Up", image: require("../../../assets/bpcHeaderImage6.png") },
    { title: "Skin Care", image: require("../../../assets/bpcHeaderImage1.png") },
  ];

  // Animated "No Items"
  const NoItemsDisplay = () => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, []);

    return (
      <Animated.View
        style={[
          styles.noItemsContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.noItemsEmoji}>🧴</Text>
        <Text style={styles.noItemsTitle}>No Products Found</Text>
        <Text style={styles.noItemsSubtext}>
          No items available in {selectedCategory} category
        </Text>
      </Animated.View>
    );
  };

  // Animate when no items
  useEffect(() => {
    const filtered =
      selectedCategory === "All"
        ? catalog
        : catalog.filter((item) => item.category_id === selectedCategory);

    if (filtered.length === 0 && selectedCategory !== "All") {
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
  }, [catalog, selectedCategory]);

  return (
    <View style={styles.container}>
      <HorizontalNavbar
        navbarTitles={buttons}
        domainColor="rgba(255, 211, 237, 1)"
        onFilterSelect={handleCategorySelect}
      />

      {/* Cards */}
      <PersonalCareCardContainer
        searchString={searchString}
        providerId={providerId}
        catalog={catalog}
        selectedCategory={selectedCategory}
      />

      {/* Show "No items" when nothing matches */}
      {selectedCategory !== "All" &&
        catalog.filter((item) => item.category_id === selectedCategory).length === 0 && (
          <NoItemsDisplay />
        )}
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
