import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import Dropdown from "./Dropdown";
import { Entypo } from "@expo/vector-icons";
import { CatalogItem } from "../../../state/types"; // ✅ unified import

interface DropdownHeaderProps {
 dropdownHeaders: string[];
  dropdownData: CatalogItem[];
  providerId: string;
  searchString: string;
  handleOpenPress: () => void;
  foodDetails: (data: any) => void;
}

const DropdownHeader: React.FC<DropdownHeaderProps> = ({
  dropdownHeaders,
  dropdownData,
  providerId,
  handleOpenPress,
  foodDetails,
  searchString,
}) => {
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>(
    dropdownHeaders.reduce((acc, header) => {
      acc[header] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleDropdown = (header: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [header]: !prev[header],
    }));
  };

  const getCountForCategory = (category: string) =>
    dropdownData.filter((item) => item.category_id === category).length;

  return (
    <View>
      {dropdownHeaders.map((item) => {
        const headerTitle = item
          .replace(/_/g, " ")
          .replace(/^\w/, (c) => c.toUpperCase());

        return (
          <View key={item}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                ...styles.categoriesHeader_container,
                borderWidth: dropdownStates[item] ? 0 : 0.5,
              }}
              onPress={() => toggleDropdown(item)}
            >
              <View style={styles.headerRow}>
                <Text style={styles.headerText}>
                  {`${headerTitle} (${getCountForCategory(item)})`}
                </Text>
                <Entypo
                  name={
                    dropdownStates[item]
                      ? "chevron-small-up"
                      : "chevron-small-down"
                  }
                  size={24}
                  color="black"
                />
              </View>
            </TouchableOpacity>

            {dropdownStates[item] && (
              <Dropdown
                data={dropdownData}
                isVisible={true}
                providerId={providerId}
                handleOpenPress={handleOpenPress}
                foodDetails={foodDetails}
                searchString={searchString}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesHeader_container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 5,
    borderColor: "#D0D0D0",
    borderRadius: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "900",
  },
});

export default DropdownHeader;
