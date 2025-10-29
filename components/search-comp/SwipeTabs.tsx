import React, { FC } from "react";
import { Animated, TouchableOpacity, View, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface SwipeTabsProps {
  tabAnim: Animated.AnimatedInterpolation<number>;
  totalItems: number;
  totalStores: number;
  domainData?: string;
  setIsItem: (val: boolean) => void;
}

const SwipeTabs: FC<SwipeTabsProps> = ({
  tabAnim,
  totalItems,
  totalStores,
  domainData,
  setIsItem,
}) => {
  const TAB_WIDTH = width / 2; // keep consistent with swipe view

  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "center",
        width: TAB_WIDTH * 2, // full width
        backgroundColor: "rgba(255,81,81,0.08)",
        borderRadius: 20,
        padding: 4,
        marginTop: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔴 Animated slider behind active tab */}
      <Animated.View
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: TAB_WIDTH - 8, // match tab size minus padding
          height: 32,
          borderRadius: 16,
          backgroundColor: "#FF5151",
          transform: [
            {
              translateX: tabAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, TAB_WIDTH], // moves exactly one tab width
              }),
            },
          ],
        }}
      />

      {/* 🟢 Items Tab */}
      <AnimatedTouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsItem(true)}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: 35,
        }}
      >
        <Animated.Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: tabAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["#fff", "#1f0404"],
            }),
          }}
        >
          ITEMS ({totalItems})
        </Animated.Text>
      </AnimatedTouchableOpacity>

      {/* 🟣 Stores Tab */}
      <AnimatedTouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsItem(false)}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: 35,
        }}
      >
        <Animated.Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: tabAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["#1f0404", "#fff"],
            }),
          }}
        >
          {domainData === "ONDC:RET11" ? "Restaurants" : "Stores"} ({totalStores})
        </Animated.Text>
      </AnimatedTouchableOpacity>
    </View>
  );
};

export default SwipeTabs;
