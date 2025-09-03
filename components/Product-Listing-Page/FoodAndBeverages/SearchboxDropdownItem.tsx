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
    image?: string;
    name: string;
    symbol?: string;
    id: string;
    slug?: string;
  };
  search: (text: string) => void;
  onPress?: () => void;
}

const SearchboxDropdownItem: React.FC<SearchboxDropdownItemProps> = ({
  item,
  search,
}) => {
  const handlePress = () => {
    try {
      const identifier = item.slug || item.id;
      router.push(`/(tabs)/home/result/productDetails/${identifier}`);
      search(item.name);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const getImageSource = () => {
    if (item.image && item.image.trim() !== "") {
      return { uri: item.image };
    }
    if (item.symbol && item.symbol.trim() !== "") {
      return { uri: item.symbol };
    }
    return { uri: "https://via.placeholder.com/40?text=?" };
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.dropdownItemContainer}>
      <View style={styles.dropdownItem}>
        <Image source={getImageSource()} style={styles.itemImg} />
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
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
    backgroundColor: "#f0f0f0",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 10,
    flex: 1,
  },
});

export default SearchboxDropdownItem;
