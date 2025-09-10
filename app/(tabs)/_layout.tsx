import { router, Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useCartStore } from "../../state/useCartStore";
import { useHideTabBarStore } from "../../components/common/hideTabBar";
import {
  CartTab,
  Hometab,
  ProfileTab,
} from "@/constants/icons/tabIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useUserDetails from "../../hook/useUserDetails";

export default function TabsLayout() {
  const { allCarts, loadCartFromStorage, syncCartFromApi } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;

  // ✅ Load cart data when the app starts
  useEffect(() => {
    // First load from storage (for immediate display)
    loadCartFromStorage();
  }, []); // Only run once on mount

  // ✅ Sync from API when authToken changes
  useEffect(() => {
    if (authToken) {
      syncCartFromApi(authToken);
    }
  }, [authToken]); // Only depend on authToken

  let totalItems = 0;
  for (const cart of allCarts) {
    for (const item of cart.cart_items) {
      totalItems += item.qty;
    }
  }
  

  const hideTabBar = useHideTabBarStore((state) => state.hideTabBar);

  // Updated colors to match Martpe design
  const activeTabColor = "#ff3c41"; // Orange/red color from Martpe
  const inactiveTabColor = "#060606"; // Light gray
  const backgroundColor = "#ffffff"; // White background

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTabColor,
        tabBarInactiveTintColor: inactiveTabColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: backgroundColor,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          borderRightWidth: 1,
          borderRightColor: "#F0F0F0",
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TouchableOpacity style={{ alignItems: "center", justifyContent: "center" }}
          onPress={() => router.push({ pathname: "/(tabs)/home/HomeScreen" })}
            >
              <Hometab
                color={focused ? activeTabColor : inactiveTabColor}
                active={focused}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 2. Cart Tab */}
      <Tabs.Screen
        name="cart"
        options={{
          tabBarLabel: "Cart",
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <CartTab
                color={focused ? activeTabColor : inactiveTabColor}
                active={focused}
                itemCount={totalItems}
              />
            </View>
          ),
        }}
      />

      {/* 3. Orders Tab */}
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: "Orders",
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <MaterialCommunityIcons
                name={
                  focused ? "package-variant-closed" : "package-variant-closed"
                }
                size={22}
                color={focused ? activeTabColor : inactiveTabColor}
              />
            </View>
          ),
        }}
      />

      {/* 4. Account Tab */}
      <Tabs.Screen
        name="account"
        options={{
          tabBarLabel: "Account",
          title: "Account",
          tabBarStyle: {
            display: hideTabBar ? "none" : "flex",
            height: 70,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor: backgroundColor,
            borderTopWidth: 1,
            borderTopColor: "#F0F0F0",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            borderRightWidth: 0,
          },
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <ProfileTab
                color={focused ? activeTabColor : inactiveTabColor}
                active={focused}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}