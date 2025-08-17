import React, { FC, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");

const tabOptions = [
  { id: 1, title: "Items" },
  { id: 2, title: "Outlets" },
];

export type WishlistTab = "Items" | "Outlets";

interface TabBarProps {
  selectTab: React.Dispatch<React.SetStateAction<WishlistTab>>;
}

const TabBar: FC<TabBarProps> = ({ selectTab }) => {
  const [selectedTab, setSelectedTab] = useState<WishlistTab>("Items");

  // Animated value for sliding
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTab = (tab: WishlistTab, index: number) => {
    setSelectedTab(tab);
    selectTab(tab);

    // Animate the sliding indicator
    Animated.spring(slideAnim, {
      toValue: index * (width * 0.3), // half of container width
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={{
        width,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: width * 0.6,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 10,
          borderRadius: 50,
          backgroundColor: "rgba(255, 81, 81, 0.15)",
          position: "relative",
        }}
      >
        {/* Sliding Indicator */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            width: width * 0.3,
            height: "100%",
            backgroundColor: "#FF5151",
            borderRadius: 50,
            transform: [{ translateX: slideAnim }],
          }}
        />

        {tabOptions.map((tab, index) => (
          <TouchableOpacity
            key={tab.id}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 10,
            }}
            onPress={() => handleTab(tab.title as WishlistTab, index)}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selectedTab === tab.title ? "white" : "black",
              }}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TabBar;
