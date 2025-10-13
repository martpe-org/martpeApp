import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";
import PLPFnBCard from "./PLPFnBCard";
import { StoreItem } from "@/components/store/fetch-store-items-type";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PLPFnBCardContainerProps {
  items?: StoreItem[];
  selectedCategory?: string;
  searchString: string;
  storeId: string;
  storeName: string;
  vegFilter?: "All" | "Veg" | "Non-Veg";
}

const PLPFnBCardContainer: React.FC<PLPFnBCardContainerProps> = ({
  items = [],
  selectedCategory,
  searchString,
  vegFilter = "All",
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // 🥦 Step 1: Filter Veg/Non-Veg
  const vegFiltered = useMemo(() => {
    if (vegFilter === "Veg") return items.filter((i) => i.diet_type?.toLowerCase() === "veg");
    if (vegFilter === "Non-Veg") return items.filter((i) => i.diet_type?.toLowerCase() === "non-veg");
    return items;
  }, [items, vegFilter]);

  // 🎯 Step 2: Filter selected category
  const categoryFiltered = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") return vegFiltered;
    return vegFiltered.filter((i) => i.category_id === selectedCategory);
  }, [vegFiltered, selectedCategory]);

  // 🔍 Step 3: Search filter
  const displayed = useMemo(() => {
    return categoryFiltered.filter((i) =>
      searchString
        ? i.name.toLowerCase().includes(searchString.toLowerCase())
        : true
    );
  }, [categoryFiltered, searchString]);

  // 🗂️ Step 4: Group by category_id (not category name)
  const grouped = useMemo(() => {
    const groups: Record<string, StoreItem[]> = {};
    displayed.forEach((item) => {
      const catKey = item.category_id || "uncategorized";
      if (!groups[catKey]) groups[catKey] = [];
      groups[catKey].push(item);
    });
    return groups;
  }, [displayed]);

  const toggleCategory = (cat: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  if (displayed.length === 0) {
    return <NoItems category={selectedCategory || "this category"} />;
  }

  const categoryKeys = Object.keys(grouped);

  // 🧩 If only one category exists, render flat list (no wrapper)
  if (categoryKeys.length === 1) {
    const onlyCategoryItems = grouped[categoryKeys[0]];
    return (
      <View style={styles.itemsWrapper}>
        {onlyCategoryItems.map((item, idx) => (
          <PLPFnBCard
            key={item.symbol || idx}
            id={item.symbol}
            productId={item.symbol}
            itemName={item.name}
            cost={item.price?.value || 0}
            providerId={item.store_id}
            slug={item.slug}
            catalogId={item.catalog_id}
            weight={item.unitized?.measure?.value}
            unit={item.unitized?.measure?.unit}
            originalPrice={item.price?.maximum_value}
            discount={item.price?.offerPercent}
            symbol={item.symbol}
            image={item.images?.[0]}
            item={item}
            customizable={item.customizable}
            directlyLinkedCustomGroupIds={item.custom_menu_id || []}
            veg={item.diet_type?.toLowerCase() === "veg"}
            non_veg={item.diet_type?.toLowerCase() === "non-veg"}
          />
        ))}
      </View>
    );
  }

  // ✅ Otherwise render grouped sections
  return (
    <ScrollView style={styles.scroll}>
      {Object.entries(grouped).map(([categoryId, catItems]) => {
        const expanded = expandedCategories[categoryId] ?? true;
        const categoryName =
          catItems[0]?.category ||
          catItems[0]?.category_name ||
          "Category";

        return (
          <View key={categoryId} style={styles.categoryWrapper}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => toggleCategory(categoryId)}
              activeOpacity={0.7}
            >
              <Text style={styles.headerTitle}>{categoryName}</Text>
              <Text style={styles.arrow}>{expanded ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {expanded && (
              <View style={styles.itemsWrapper}>
                {catItems.map((item, idx) => (
                  <PLPFnBCard
                    key={item.symbol || idx}
                    id={item.symbol}
                    productId={item.symbol}
                    itemName={item.name}
                    cost={item.price?.value || 0}
                    providerId={item.store_id}
                    slug={item.slug}
                    catalogId={item.catalog_id}
                    weight={item.unitized?.measure?.value}
                    unit={item.unitized?.measure?.unit}
                    originalPrice={item.price?.maximum_value}
                    discount={item.price?.offerPercent}
                    symbol={item.symbol}
                    image={item.images?.[0]}
                    item={item}
                    customizable={item.customizable}
                    directlyLinkedCustomGroupIds={item.custom_menu_id || []}
                    veg={item.diet_type?.toLowerCase() === "veg"}
                    non_veg={item.diet_type?.toLowerCase() === "non-veg"}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

// 🕳️ Empty State
const NoItems: React.FC<{ category: string }> = ({ category }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
    ]).start();
  });

  return (
    <Animated.View style={[styles.empty, { opacity: fade, transform: [{ scale }] }]}>
      <Text style={styles.emoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>No Food Items Found</Text>
      <Text style={styles.emptySub}>
        No items available in <Text style={{ fontWeight: "600" }}>{category}</Text>
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fff" },
  categoryWrapper: { marginBottom: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
  },
  headerTitle: { fontWeight: "600", fontSize: 16 },
  arrow: { fontSize: 14 },
  itemsWrapper: { paddingHorizontal: 8 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    flex: 1,
  },
  emoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, color: "#666" },
});

export default PLPFnBCardContainer;
