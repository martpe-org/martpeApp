import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import HorizontalNavbar from "../Grocery/HorizontalNavbar";
import GroceryCardContainer, { CatalogItem } from "../Grocery/GroceryCardContainer"; // ✅ Import the interface

interface PLPElectronicsProps {
  catalog: CatalogItem[]; // ✅ Use the same interface as GroceryCardContainer
  sidebarTitles?: string[];
  providerId: string;
  searchString: string;
}

const PLPElectronics: React.FC<PLPElectronicsProps> = ({
  catalog,
  sidebarTitles,
  providerId,
  searchString,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Use sidebarTitles if provided, otherwise use predefined buttons
  const getNavbarButtons = () => {
    // Default electronics categories with their specific images
    const defaultButtons = [
      { title: "All", image: require("../../../assets/electronicsHeaderImage1.png") },
      { title: "Audio", image: require("../../../assets/electronicsHeaderImage1.png") },
      { title: "Camera", image: require("../../../assets/electronicsHeaderImage2.png") },
      { title: "Computer Peripherals", image: require("../../../assets/electronicsHeaderImage3.png") },
      { title: "Desktop & Laptop", image: require("../../../assets/electronicsHeaderImage4.png") },
      { title: "Earphone", image: require("../../../assets/electronicsHeaderImage5.png") },
      { title: "Gaming", image: require("../../../assets/electronicsHeaderImage6.png") },
      { title: "Headphone", image: require("../../../assets/electronicsHeaderImage7.png") },
      { title: "Mobile Phone", image: require("../../../assets/electronicsHeaderImage8.png") },
      { title: "Accessories", image: require("../../../assets/electronicsHeaderImage9.png") },
      { title: "Smart Watches", image: require("../../../assets/electronicsHeaderImage10.png") },
    ];

    if (sidebarTitles && sidebarTitles.length > 0) {
      // Map sidebarTitles to their corresponding images
      const mappedButtons = sidebarTitles.map((title) => {
        // Find matching button from defaultButtons
        const matchingButton = defaultButtons.find(btn => btn.title === title);
        return matchingButton || { title, image: undefined };
      });

      // Add "All" to the beginning if not present
      const hasAll = mappedButtons.some(btn => btn.title === "All");
      if (!hasAll) {
        return [defaultButtons[0], ...mappedButtons]; // Add "All" button first
      }
      return mappedButtons;
    }

    // Return all default buttons
    return defaultButtons;
  };

  const navbarButtons = getNavbarButtons();

  // Function to filter catalog based on selected category
const getFilteredCatalog = (): CatalogItem[] => {
  if (activeCategory === "All") {
    return catalog;
  }

  return catalog.filter((item) => {
    const itemName = item?.descriptor?.name?.toLowerCase() || "";
    const itemDesc = item?.descriptor?.long_desc?.toLowerCase() || "";

    switch (activeCategory) {
      case "Audio":
        return (
          itemName.includes("audio") ||
          itemName.includes("speaker") ||
          itemName.includes("soundbar") ||
          itemDesc.includes("audio")
        );

      case "Camera":
        return (
          itemName.includes("camera") ||
          itemName.includes("lens") ||
          itemName.includes("dslr") ||
          itemDesc.includes("camera")
        );

      case "Computer Peripherals":
        return (
          itemName.includes("keyboard") ||
          itemName.includes("mouse") ||
          itemName.includes("monitor") ||
          itemName.includes("webcam") ||
          itemDesc.includes("peripheral")
        );

      case "Desktop & Laptop":
        return (
          itemName.includes("laptop") ||
          itemName.includes("desktop") ||
          itemName.includes("computer") ||
          itemDesc.includes("laptop") ||
          itemDesc.includes("desktop")
        );

      case "Earphone":
        return (
          itemName.includes("earphone") ||
          itemName.includes("earbud") ||
          itemDesc.includes("earphone")
        );

      case "Gaming":
        return (
          itemName.includes("gaming") ||
          itemName.includes("console") ||
          itemName.includes("controller") ||
          itemDesc.includes("gaming")
        );

      case "Headphone":
        return (
          itemName.includes("headphone") ||
          itemName.includes("headset") ||
          itemDesc.includes("headphone")
        );

      case "Mobile Phone":
        return (
          itemName.includes("mobile") ||
          itemName.includes("phone") ||
          itemName.includes("smartphone") ||
          itemDesc.includes("mobile") ||
          itemDesc.includes("phone")
        );

      case "Accessories":
        return (
          itemName.includes("accessory") ||
          itemName.includes("case") ||
          itemName.includes("cover") ||
          itemName.includes("charger") ||
          itemDesc.includes("accessory")
        );

      case "Smart Watches":
        return (
          itemName.includes("watch") ||
          itemName.includes("smartwatch") ||
          itemName.includes("wearable") ||
          itemDesc.includes("watch")
        );

      default:
        return true;
    }
  });
};
  const filteredCatalog = getFilteredCatalog()

  // Animation for "No items" message
  useEffect(() => {
    if (filteredCatalog.length === 0 && activeCategory !== "All") {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [filteredCatalog.length, activeCategory]);

  // Animated "No Items" Component
  const NoItemsDisplay: React.FC = () => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
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
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim }
            ],
          },
        ]}
      >
        <Text style={styles.noItemsText}>📱</Text>
        <Text style={styles.noItemsTitle}>No Items Found</Text>
        <Text style={styles.noItemsSubtext}>
          No electronics available in {activeCategory} category
        </Text>
      </Animated.View>
    );
  };

  const handleCategorySelect = (title: string) => {
    setActiveCategory(title);
    console.log("Selected Category:", title);
  };

  return (
    <View style={{ flex: 1 }}>
      <HorizontalNavbar
        navbarTitles={navbarButtons}
        domainColor=""
        onFilterSelect={handleCategorySelect}
        activeCategory={activeCategory}
      />
      {filteredCatalog.length > 0 ? (
        <GroceryCardContainer
          providerId={providerId}
          searchString={searchString}
          catalog={filteredCatalog}
          selectedCategory={activeCategory}
        />
      ) : activeCategory !== "All" ? (
        <NoItemsDisplay />
      ) : (
        <GroceryCardContainer
          providerId={providerId}
          searchString={searchString}
          catalog={catalog}
          selectedCategory={activeCategory}
        />
      )}
    </View>
  );
};

export default PLPElectronics;

// Styles for the animated "No Items" display
const styles = StyleSheet.create({
  noItemsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  noItemsText: {
    fontSize: 48,
    marginBottom: 16,
  },
  noItemsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  noItemsSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});