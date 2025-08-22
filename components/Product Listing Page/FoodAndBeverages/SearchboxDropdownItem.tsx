import { router } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchboxDropdownItemProps {
  item: {
    image: string;
    name: string;
    id: string;
    slug?: string;
  };
  search: (text: string) => void;
  onPress?: () => void;
}

const SearchboxDropdownItem: React.FC<SearchboxDropdownItemProps> = ({
  item,
  search,
  onPress,
}) => {
  const handlePress = () => {
    try {
      const identifier = item.slug || item.id;
      router.push(`/(tabs)/home/result/productDetails/${identifier}`);
      
      // Update search after navigation starts
      search(item.name);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.dropdownItemContainer}
    >
      <View style={styles.dropdownItem}>
        <Image source={{ uri: item.image }} style={styles.itemImg} />
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    flex: 1,
  },
  itemImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 10,
    flex: 1,
  },
});

export default SearchboxDropdownItem;