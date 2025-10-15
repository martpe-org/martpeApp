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
import { CustomMenu } from "@/components/store/fetch-store-details-type";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PLPFnBCardContainerProps {
  items?: StoreItem[];
  menus: CustomMenu[]; // obtained from store details
  selectedCategory?: string;
  searchString: string;
  storeId: string;
  storeName: string;
  vegFilter?: "All" | "Veg" | "Non-Veg";
}

const PLPFnBCardContainer: React.FC<PLPFnBCardContainerProps> = ({
  items = [],
  menus = [],
  selectedCategory,
  searchString,
  vegFilter = "All",
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Filter Veg / Non-Veg
  const vegFiltered = useMemo(() => {
    if (vegFilter === "Veg") return items.filter((i) => i.diet_type?.toLowerCase() === "veg");
    if (vegFilter === "Non-Veg") return items.filter((i) => i.diet_type?.toLowerCase() === "non_veg");
    return items;
  }, [items, vegFilter]);

  // Search filter
  const displayed = useMemo(
    () =>
      vegFiltered.filter((i) =>
        searchString ? i.name.toLowerCase().includes(searchString.toLowerCase()) : true
      ),
    [vegFiltered, searchString]
  );

  if (!displayed.length) return <NoItems category={selectedCategory || "this category"} />;
  if (menus.length > 0) {
    const visibleMenus = menus.filter((menu) =>
      displayed.some((item) =>
        Array.isArray(item.custom_menu_id)
          ? item.custom_menu_id.includes(menu.custom_menu_id)
          : item.custom_menu_id === menu.custom_menu_id
      )
    );
    return (
      <ScrollView style={styles.scroll}>
        {visibleMenus.map((menu) => {
          const filtered = displayed.filter((i) =>
            Array.isArray(i.custom_menu_id)
              ? i.custom_menu_id.includes(menu.custom_menu_id)
              : i.custom_menu_id === menu.custom_menu_id
          );

          const expanded = expandedMenus[menu.custom_menu_id] ?? true;

          return (
            <View key={menu.custom_menu_id} style={styles.menuSection}>
              {/* HEADER */}
              <TouchableOpacity
                style={[styles.menuHeader, expanded && styles.menuHeaderExpanded]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setExpandedMenus((prev) => ({
                    ...prev,
                    [menu.custom_menu_id]: !expanded,
                  }));
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuTitle}>
                  {menu.name?.replace(/([^\w\s])/g, " $1 ")}
                </Text>
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#693434"
                />
                  </TouchableOpacity>

              {/* CONTENT */}
              {expanded && (
                <View style={styles.menuContent}>
                  {filtered.map((item, idx) => (
                    <PLPFnBCard
                      key={item.slug || idx}
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
                      non_veg={item.diet_type?.toLowerCase() === "non_veg"}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // --- FALLBACK (NO MENUS) ---
  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.menuContent}>
        {displayed.map((item, idx) => (
          <PLPFnBCard
            key={item.slug || idx}
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
            non_veg={item.diet_type?.toLowerCase() === "non_veg"}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const NoItems: React.FC<{ category: string }> = ({ category }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
    ]).start();
  }, [fade, scale]);

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

  // Wrapper for each menu
  menuSection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },

  // Header style (menu title)
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fef2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuHeaderExpanded: {
    backgroundColor: "#fde8e8",
  },
  menuTitle: {
    fontWeight: "500",
    fontSize: 16,
    color: "#e75c5c",
  },
  menuContent: {
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },

  // Empty state
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    flex: 1,
  },
  emoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  emptySub: { fontSize: 14, color: "#666" },
});

export default PLPFnBCardContainer;
