import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

interface HeaderTabsProps {
  buttonTitles: string[];
  onFilterChange: (filter: string) => void;
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({
  buttonTitles,
  onFilterChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>("All");

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    onFilterChange(tab);
  };

  return (
    <View style={styles.container}>
      {buttonTitles.map((title) => {
        const isActive = activeTab === title;
        return (
          <TouchableOpacity
            key={title}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
            onPress={() => handleTabPress(title)}
            activeOpacity={0.7}
          >
            {/* Icon for Veg/Non-Veg */}
            {title === "Veg" && (
              <MaterialCommunityIcons
                name="circle-box-outline"
                size={16}
                color={isActive ? "#fff" : "green"}
                style={{ marginRight: 4 }}
              />
            )}
            {title === "Non-Veg" && (
              <MaterialCommunityIcons
                name="circle-box-outline"
                size={16}
                color={isActive ? "#fff" : "red"}
                style={{ marginRight: 4 }}
              />
            )}

            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default HeaderTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  activeTab: {
    backgroundColor: "#1DA578",
    borderColor: "#1DA578",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
});