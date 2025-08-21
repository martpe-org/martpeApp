import { FC } from "react";
import {  Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useEffect } from "react";
import FashionCard from "./FashionCard";

interface CatalogItem {
  bpp_id: string;
  bpp_uri: string;
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
  location_id: string;
  non_veg: boolean | null;
  price: {
    maximum_value: number;
    offer_percent: number | null;
    offer_value: number | null;
    value: number;
  };
  provider_id: string;
  quantity: {
    available: number | null;
    maximum: number | null;
  };
  veg: boolean | null;
  slug?: string;
}

interface PLPCardContainerProps {
  catalog: CatalogItem[];
  domainColor: string;
  selectedCategory: string;
  providerId: string;
}

// No Items Animation Component
const NoItemsDisplay: FC<{ category: string }> = ({ category }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial animation
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

    // Pulse animation
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
        noItemsStyles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim }
          ],
        },
      ]}
    >
      <Text style={noItemsStyles.emoji}>👗</Text>
      <Text style={noItemsStyles.title}>No Items Available</Text>
      <Text style={noItemsStyles.subtitle}>
        No fashion items found in {category} category
      </Text>
    </Animated.View>
  );
};

const PLPCardContainer: FC<PLPCardContainerProps> = ({
  catalog,
  domainColor,
  selectedCategory,
  providerId,
}) => {
  const bgColor = domainColor.slice(0, -3);
  const gradientColors = [
    bgColor + "1)",
    bgColor + "0.7486)",
    bgColor + "0.1)",
  ];

  // Filter catalog based on selected category
const getFilteredCatalog = (): CatalogItem[] => {
  if (selectedCategory === "All") {
    return catalog;
  }

  return catalog.filter((item) => {
    const itemName = item?.descriptor?.name?.toLowerCase() || "";
    const itemDesc = item?.descriptor?.long_desc?.toLowerCase() || "";
    const itemShortDesc = item?.descriptor?.short_desc?.toLowerCase() || "";

    switch (selectedCategory.toLowerCase()) {
      case "men":
        return (
          itemName.includes("men") ||
          itemName.includes("man") ||
          itemDesc.includes("men") ||
          itemDesc.includes("male")
        );

      case "women":
        return (
          itemName.includes("women") ||
          itemName.includes("woman") ||
          itemName.includes("ladies") ||
          itemDesc.includes("women") ||
          itemDesc.includes("female")
        );

      case "kids":
        return (
          itemName.includes("kid") ||
          itemName.includes("child") ||
          itemName.includes("boy") ||
          itemName.includes("girl") ||
          itemDesc.includes("kids")
        );

      case "infants":
        return (
          itemName.includes("infant") ||
          itemName.includes("baby") ||
          itemName.includes("newborn") ||
          itemDesc.includes("infant")
        );

      case "t-shirts":
        return (
          itemName.includes("t-shirt") ||
          itemName.includes("tshirt") ||
          itemName.includes("t shirt")
        );

      case "shirts":
        return (
          itemName.includes("shirt") &&
          !itemName.includes("t-shirt") &&
          !itemName.includes("tshirt")
        );

      case "trousers":
        return (
          itemName.includes("trouser") ||
          itemName.includes("pant") ||
          itemName.includes("jean")
        );

      case "accessories":
        return (
          itemName.includes("accessory") ||
          itemName.includes("belt") ||
          itemName.includes("watch") ||
          itemName.includes("wallet")
        );

      case "footwear":
        return (
          itemName.includes("shoe") ||
          itemName.includes("sandal") ||
          itemName.includes("boot") ||
          itemName.includes("slipper")
        );

      case "bags":
        return (
          itemName.includes("bag") ||
          itemName.includes("backpack") ||
          itemName.includes("purse")
        );

      case "jewellery":
        return (
          itemName.includes("jewel") ||
          itemName.includes("ring") ||
          itemName.includes("necklace") ||
          itemName.includes("earring")
        );

      default:
        return (
          itemName.includes(selectedCategory.toLowerCase()) ||
          itemDesc.includes(selectedCategory.toLowerCase()) ||
          itemShortDesc.includes(selectedCategory.toLowerCase())
        );
    }
  });
};

  const filteredCatalog = getFilteredCatalog();

  if (filteredCatalog.length === 0 && selectedCategory !== "All") {
    return <NoItemsDisplay category={selectedCategory} />;
  }

  return (
    <LinearGradient
      colors={[gradientColors[0], gradientColors[1], gradientColors[2]]}
      start={[0, 0]}
      end={[0, 0.1]}
      style={styles.container}
    >
      {filteredCatalog.map((item) => {
        const name = item?.descriptor?.name;
        const desc = item?.descriptor?.long_desc;
        const value = item?.price?.value;
        const maxPrice = item?.price?.maximum_value;
        const discount = item?.price?.offer_percent || 
          (maxPrice ? (((maxPrice - value) / maxPrice) * 100).toFixed(0) : 0);
        const image = item?.descriptor?.symbol || item?.descriptor?.images?.[0];

        return (
          <FashionCard
            key={item?.id}
            itemName={name}
            desc={desc}
            value={value}
            maxPrice={maxPrice}
            discount={discount}
            image={image}
            id={item.id}
            catalogId={item.catalog_id}
            providerId={providerId}
            slug={item.slug}
          />
        );
      })}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    padding: 10,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
});

const noItemsStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom:50
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PLPCardContainer;
