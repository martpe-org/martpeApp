import React, { FC, useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CONTAINER_WIDTH = width * 0.6;
const TAB_WIDTH = CONTAINER_WIDTH / 2;

export type WishlistTab = "Items" | "Stores";

interface TabBarProps {
  selectTab: (tab: WishlistTab) => void;
  selectedTab?: WishlistTab;
  itemsCount?: number;
  outletsCount?: number;
}

const tabOptions = [
  { id: 1, title: "Items" },
  { id: 2, title: "Stores" },
];

const TabBar: FC<TabBarProps> = ({ selectedTab: propSelectedTab = "Items", selectTab, itemsCount = 0, outletsCount = 0 }) => {
  const [internalSelectedTab, setInternalSelectedTab] = useState<WishlistTab>("Items");
  const selectedTab = propSelectedTab || internalSelectedTab;

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = selectedTab === "Items" ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [selectedTab]);

  const handleTab = (tab: WishlistTab, index: number) => {
    if (!propSelectedTab) setInternalSelectedTab(tab);
    selectTab(tab);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer}>
        <Animated.View style={[styles.slider, { transform: [{ translateX: slideAnim }] }]} />

        {tabOptions.map((tab, index) => (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => handleTab(tab.title as WishlistTab, index)} activeOpacity={0.8}>
            <Text style={[styles.tabText, selectedTab === tab.title && styles.tabTextActive]}>
              {tab.title}
              {tab.title === "Items" && itemsCount > 0 && ` (${itemsCount})`}
              {tab.title === "Stores" && outletsCount > 0 && ` (${outletsCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tabContainer: {
    width: CONTAINER_WIDTH,
    height: 40,
    borderRadius: 50,
    backgroundColor: "rgba(255, 81, 81, 0.15)",
    flexDirection: "row",
    overflow: "hidden",
    position: "relative",
  },
  slider: {
    position: "absolute",
    left: 0,
    width: TAB_WIDTH,
    height: "100%",
    backgroundColor: "#FF5151",
    borderRadius: 50,
  },
  tab: {
    width: TAB_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  tabTextActive: {
    color: "#fff",
  },
});

export default TabBar;
