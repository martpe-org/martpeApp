import React, { FC, useRef, useEffect } from "react";
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
  animatedValue?: Animated.Value; // 🔥 Added
}

const TabBar: FC<TabBarProps> = ({
  selectedTab: propSelectedTab = "Items",
  selectTab,
  itemsCount = 0,
  outletsCount = 0,
  animatedValue,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Link slider position to external animation (translateX)
  useEffect(() => {
    if (!animatedValue) return;

    const listenerId = animatedValue.addListener(({ value }) => {
      // Map translateX (0 to -width) → slider (0 to TAB_WIDTH)
      const mapped = (-value / width) * TAB_WIDTH;
      slideAnim.setValue(mapped);
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer}>
        <Animated.View style={[styles.slider, { transform: [{ translateX: slideAnim }] }]} />

        {["Items", "Stores"].map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => selectTab(tab as WishlistTab)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                propSelectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
              {tab === "Items" && itemsCount > 0 && ` (${itemsCount})`}
              {tab === "Stores" && outletsCount > 0 && ` (${outletsCount})`}
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
