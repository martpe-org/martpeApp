import React, { FC } from "react";
import { Animated, TouchableOpacity, View, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

interface TabBarProps {
  isItem: boolean;
  tabAnim: Animated.AnimatedInterpolation<number>;
  itemsCount: number;
  storesCount: number;
  setIsItem: (val: boolean) => void;
}

const TabBar: FC<TabBarProps> = ({
  isItem,
  tabAnim,
  itemsCount,
  storesCount,
  setIsItem,
}) => {
  const containerWidth = width * 0.9; // full width with slight padding
  const TAB_WIDTH = containerWidth / 2;

  // Slider movement
  const sliderTranslateX = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_WIDTH],
    extrapolate: "clamp",
  });

  // Tab scale animations (safe for native driver)
  const itemsScale = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.05, 0.95],
    extrapolate: "clamp",
  });

  const storesScale = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
    extrapolate: "clamp",
  });

  // Text colors
  const itemsTextColor = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fff", "#1f0404"],
    extrapolate: "clamp",
  });

  const storesTextColor = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1f0404", "#fff"],
    extrapolate: "clamp",
  });

  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "center",
        width: containerWidth,
        backgroundColor: "rgba(255,81,81,0.08)",
        borderRadius: 22,
        padding: 4,
        marginTop: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔴 Animated slider */}
      <Animated.View
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: TAB_WIDTH - 8,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#FF5151",
          transform: [{ translateX: sliderTranslateX }],
        }}
      />

      {/* 🟢 Items Tab */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: 35,
          transform: [{ scale: itemsScale }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsItem(true)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Animated.Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: itemsTextColor,
            }}
          >
            ITEMS ({itemsCount})
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 🟣 Stores Tab */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: 35,
          transform: [{ scale: storesScale }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsItem(false)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Animated.Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: storesTextColor,
            }}
          >
            STORES ({storesCount})
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default TabBar;
