import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import HomeAndDecorHeaderTabs from "./HomeAndDecorHeaderTabs";
import PLPCardContainer from "../Fashion/PLPCardContainer";

interface CatalogItem {
  bpp_id: string;
  bpp_uri: string;
  catalog_id: string;
  category_id: string;
  descriptor: {
    images: string[];
    long_desc?: string;  // ✅ made optional
    name?: string;       // ✅ made optional
    short_desc?: string; // ✅ made optional
    symbol?: string;
  };
  id: string;
  location_id: string;
  non_veg: any;
  price: {
    maximum_value: number;
    offer_percent: any;
    offer_value: any;
    value: number;
  };
  provider_id: string;
  quantity: {
    available: any;
    maximum: any;
  };
  veg: any;
}

interface PLPHomeAndDecorProps {
  catalog: CatalogItem[];
}

const PLPHomeAndDecor: React.FC<PLPHomeAndDecorProps> = ({ catalog }) => {
  const [activeTab, setActiveTab] = useState<string>("Home & Decor");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // ✅ Safe filtering
const getFilteredCatalog = () => {
  if (!activeTab || activeTab === "All") {
    return catalog;
  }

  return catalog.filter((item) => {
const itemName = item?.descriptor?.name?.toLowerCase() || "";
const itemDesc = item?.descriptor?.long_desc?.toLowerCase() || "";
const itemShortDesc = item?.descriptor?.short_desc?.toLowerCase() || "";


    switch (activeTab) {
      case "Furniture":
        return (
          itemName.includes("furniture") ||
          itemName.includes("chair") ||
          itemName.includes("table") ||
          itemName.includes("sofa") ||
          itemDesc.includes("furniture")
        );

      case "Home Furnishing":
        return (
          itemName.includes("curtain") ||
          itemName.includes("carpet") ||
          itemName.includes("bedsheet") ||
          itemName.includes("pillow") ||
          itemDesc.includes("furnishing")
        );

      case "Cooking & Dining":
        return (
          itemName.includes("kitchen") ||
          itemName.includes("dining") ||
          itemName.includes("cookware") ||
          itemName.includes("utensil") ||
          itemDesc.includes("cooking") ||
          itemDesc.includes("dining")
        );

      case "Garden & Outdoors":
        return (
          itemName.includes("garden") ||
          itemName.includes("outdoor") ||
          itemName.includes("plant") ||
          itemName.includes("patio") ||
          itemDesc.includes("garden") ||
          itemDesc.includes("outdoor")
        );

      default:
        return (
          itemName.includes(activeTab) ||
          itemDesc.includes(activeTab) ||
          itemShortDesc.includes(activeTab)
        );
    }
  });
};



const filteredCatalog = useMemo(() => getFilteredCatalog(), [catalog, activeTab]);

  // Animation for "No items"
  useEffect(() => {
    if (filteredCatalog.length === 0 && activeTab !== "Home & Decor") {
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
  }, [filteredCatalog.length, activeTab]);

  // "No Items" display
  const NoItemsDisplay = () => {
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
            transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.noItemsText}>📦</Text>
        <Text style={styles.noItemsTitle}>No Items Found</Text>
        <Text style={styles.noItemsSubtext}>
          No products available in {activeTab} category
        </Text>
      </Animated.View>
    );
  };

return (
  <View style={{ flex: 1 }}>
    <HomeAndDecorHeaderTabs activeTab={activeTab} onTabChange={setActiveTab} />

    {filteredCatalog.length > 0 ? (
      <PLPCardContainer domainColor="rgba(252, 225, 89, 1)" catalog={filteredCatalog} />
    ) : activeTab !== "Home & Decor" ? (
      <NoItemsDisplay category={activeTab} />
    ) : (
      <PLPCardContainer domainColor="rgba(252, 225, 89, 1)" catalog={catalog} />
    )}
  </View>
);

};

const styles = StyleSheet.create({
  noItemsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 50,
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

export default PLPHomeAndDecor;
