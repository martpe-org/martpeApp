import { router, Tabs } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useCartStore } from "../../state/useCartStore";
import { useHideTabBarStore } from "../../components/common/hideTabBar";
import { CartTab, Hometab, ProfileTab } from "@/constants/icons/tabIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useUserDetails from "../../hook/useUserDetails";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function TabsLayout() {
  const { allCarts, loadCartFromStorage, syncCartFromApi } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;

  // ✅ Load cart data once from storage
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // ✅ Sync with API whenever authToken changes
  useEffect(() => {
    if (authToken) {
      syncCartFromApi(authToken);
    }
  }, [authToken]);

  // ✅ Count total items in cart
  let totalItems = 0;
  for (const cart of allCarts) {
    for (const item of cart.cart_items) {
      totalItems += item.qty;
    }
  }

  const hideTabBar = useHideTabBarStore((state) => state.hideTabBar);

  const activeTabColor = "#ff3c41";
  const inactiveTabColor = "#060606";
  const backgroundColor = "#ffffff";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      {/* ✅ White background with dark icons for StatusBar */}
      <StatusBar style="dark"  />

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
            display: hideTabBar ? "none" : "flex",
            height: 70,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor,
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
          },
        }}
      >
        {/* 1. Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ focused }) => (
              <TouchableOpacity
                style={{ alignItems: "center", justifyContent: "center" }}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/home/HomeScreen" })
                }
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
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
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
    </SafeAreaView>
  );
}
