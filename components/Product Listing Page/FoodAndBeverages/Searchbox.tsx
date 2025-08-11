import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import SearchboxDropdown from "./SearchboxDropdown";
import { MaterialIcons } from "@expo/vector-icons";

interface CatalogItem {
  descriptor: {
    name: string;
    images: string[];
  };
  id: string;
}

interface SuggestionItem {
  name: string;
  image: string;
  id: string;
}

interface SearchboxProps {
  catalog: CatalogItem[];
  placeHolder: string;
  search: (text: string) => void;
}

const Searchbox: React.FC<SearchboxProps> = ({
  catalog,
  placeHolder,
  search,
}) => {
  const [isSearchboxActive, setIsSearchboxActive] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    SuggestionItem[]
  >([]);

  const addedNames: { [key: string]: boolean } = {};
  const catalogItems: SuggestionItem[] = [];
  for (const item of catalog) {
    const name = item?.descriptor?.name;
    if (!addedNames[name]) {
      addedNames[name] = true;
      catalogItems.push({
        name,
        image: item.descriptor.images?.[0] || "",
        id: item.id,
      });
    }
  }

  const handleInputChange = (text: string) => {
    setSearchInput(text);
    search(text);
    const filtered = catalogItems.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

  return (
    <>
      <View
        style={{
          ...styles.searchBoxContainer,
          position: isSearchboxActive ? "absolute" : "relative",
          top: isSearchboxActive ? 17 : 0,
          left: isSearchboxActive ? 40 : 0,
          right: isSearchboxActive ? 5 : 0,
        }}
      >
        <TextInput
          onChangeText={handleInputChange}
          onFocus={() => setIsSearchboxActive(true)}
          onBlur={() => setIsSearchboxActive(false)}
          value={searchInput}
          style={styles.searchBox}
          placeholder={`Search in ${placeHolder}`}
          placeholderTextColor="#8E8A8A"
        />
        <MaterialIcons name="search" size={24} color="black" />
      </View>

      {isSearchboxActive && searchInput && filteredSuggestions.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 75,
            right: 0,
            left: 0,
          }}
        >
          <SearchboxDropdown
            search={search}
            suggestions={filteredSuggestions}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  searchBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginBottom: 10,
    marginHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#9d9d9d",
    backgroundColor: "#FFF",
  },
  searchBox: {
    flex: 0.95,
  },
});

export default Searchbox;
