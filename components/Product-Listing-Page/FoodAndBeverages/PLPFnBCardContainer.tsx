import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  ActivityIndicator,
} from "react-native";
import PLPFnBCard from "./PLPFnBCard";
import { StoreItem } from "@/components/store/fetch-store-items-type";
import { CustomMenu } from "@/components/store/fetch-store-details-type";
import { Ionicons } from "@expo/vector-icons";
import { FetchProductDetail } from "@/components/search/search-products-type";
import { useInfiniteQuery } from "@tanstack/react-query";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PLPFnBCardContainerProps {
  items?: StoreItem[];
  menus: CustomMenu[];
  selectedCategory?: string;
  searchString: string;
  storeId: string;
  storeName: string;
  vegFilter?: "All" | "Veg" | "Non-Veg";
  storeData?: any; // ✅ Add store data prop
}

const ITEMS_PER_PAGE = 10;

const PLPFnBCardContainer: React.FC<PLPFnBCardContainerProps> = ({
  items = [],
  menus = [],
  selectedCategory,
  searchString,
  storeId,
  storeName,
  vegFilter = "All",
  storeData,

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

  const hasCustomizationGroups = (item: FetchProductDetail) => {
    if (item.directlyLinkedCustomGroupIds && item.directlyLinkedCustomGroupIds.length > 0) {
      return item.directlyLinkedCustomGroupIds;
    }
    if (item.customizable) {
      return [item.slug];
    }
    return [];
  };

  if (!displayed.length) return <NoItems category={selectedCategory || "this category"} />;

  // Filter menus that actually have visible items
  const visibleMenus = menus.filter((menu) =>
    displayed.some((item) =>
      Array.isArray(item.custom_menu_id)
        ? item.custom_menu_id.includes(menu.custom_menu_id)
        : item.custom_menu_id === menu.custom_menu_id
    )
  );

  return (
    <FlatList
      data={visibleMenus}
      keyExtractor={(menu) => menu.custom_menu_id}
      contentContainerStyle={styles.scroll}
      renderItem={({ item: menu }) => (
        <MenuSection
          menu={menu}
          displayed={displayed}
          expanded={expandedMenus[menu.custom_menu_id] ?? true}
          setExpandedMenus={setExpandedMenus}
          hasCustomizationGroups={hasCustomizationGroups}
          storeId={storeId}
          storeData={storeData}
        />
      )}
    />
  );
};

const MenuSection = ({
  menu,
  displayed,
  expanded,
  setExpandedMenus,
  hasCustomizationGroups,
  storeId,
  storeData
}: any) => {
  const filtered = displayed.filter((i :any) =>
    Array.isArray(i.custom_menu_id)
      ? i.custom_menu_id.includes(menu.custom_menu_id)
      : i.custom_menu_id === menu.custom_menu_id
  );

  // Infinite query pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["menu-items", menu.custom_menu_id],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return filtered.slice(start, end);
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < ITEMS_PER_PAGE ? undefined : allPages.length,
    initialPageParam: 0,
  });

  const paginatedItems = data?.pages.flat() ?? [];

  return (
    <View style={styles.menuSection}>
      <TouchableOpacity
        style={[styles.menuHeader, expanded && styles.menuHeaderExpanded]}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpandedMenus((prev: any) => ({
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

      {expanded && (
        <FlatList
          data={paginatedItems}
          keyExtractor={(item, idx) => item.slug || `${menu.custom_menu_id}-${idx}`}
          renderItem={({ item }) => (
            <PLPFnBCard
              key={item.slug}
              id={item.slug}                      // ✅ Use slug as id
              productId={item.slug}               // ✅ Use slug as productId
              itemName={item.name}
              cost={item.price?.value || 0}
              providerId={storeId}
              slug={item.slug}                    // ✅ Keep slug
              catalogId={item.catalog_id}
              weight={item.unitized?.measure?.value}
              unit={item.unitized?.measure?.unit}
              originalPrice={item.price?.maximum_value}
              discount={item.price?.offerPercent}
              symbol={item.symbol}                // ✅ Keep symbol for image only
              image={item.images?.[0]}
              item={item}
              customizable={item.customizable}
              directlyLinkedCustomGroupIds={hasCustomizationGroups(item)}
              veg={item.diet_type?.toLowerCase() === "veg"}
              non_veg={item.diet_type?.toLowerCase() === "non_veg"}
            />
          )}
          ListFooterComponent={
            hasNextPage ? (
              <TouchableOpacity
                style={styles.loadMore}
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color="#e75c5c" />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
};

const NoItems: React.FC<{ category: string }> = ({ category }) => (
  <View style={styles.empty}>
    <Text style={styles.emoji}>🍽️</Text>
    <Text style={styles.emptyTitle}>No Food Items Found</Text>
    <Text style={styles.emptySub}>
      No items available in <Text style={{ fontWeight: "600" }}>{category}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  scroll: { backgroundColor: "#fff", paddingBottom: 20 },
  menuSection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fef2f2",
  },
  menuHeaderExpanded: {
    backgroundColor: "#fde8e8",
  },
  menuTitle: {
    fontWeight: "500",
    fontSize: 16,
    color: "#e75c5c",
  },
  loadMore: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  loadMoreText: { color: "#e75c5c", fontWeight: "500" },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  emptySub: { fontSize: 14, color: "#666" },
});

export default PLPFnBCardContainer;