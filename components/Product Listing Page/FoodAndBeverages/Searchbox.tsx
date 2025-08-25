import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TextInput, Animated, Platform } from "react-native";
import SearchboxDropdown from "./SearchboxDropdown";
import { MaterialIcons } from "@expo/vector-icons";

interface CatalogItem {
  descriptor: {
    name: string;
    images: string[];
  };
  id: string;
  slug?: string;
}

interface SuggestionItem {
  name: string;
  image: string;
  id: string;
  slug?: string;
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

  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process catalog items (similar to the example)
  const addedNames: { [key: string]: boolean } = {};
  const catalogItems: SuggestionItem[] = [];

  for (const item of catalog) {
    const name = item?.descriptor?.name;
    if (name && !addedNames[name]) {
      addedNames[name] = true;
      catalogItems.push({
        name,
        image: item.descriptor.images?.[0] || "",
        id: item.id,
        slug: item.slug || item.id,
      });
    }
  }

  const handleInputChange = (text: string) => {
    setSearchInput(text);

    if (text.trim()) {
      const filtered = catalogItems.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase().trim())
      );
      setFilteredSuggestions(filtered);
      setIsSearchboxActive(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsSearchboxActive(false);
    }
  };

  const handleFocus = () => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    // Always show suggestions if there's input and matches
    if (searchInput.trim()) {
      const filtered = catalogItems.filter((item) =>
        item.name.toLowerCase().includes(searchInput.toLowerCase().trim())
      );
      setFilteredSuggestions(filtered);
      setIsSearchboxActive(filtered.length > 0);
    }
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setSearchInput(suggestion.name);

    // trigger search only here
    search(suggestion.name);

    setTimeout(() => {
      setFilteredSuggestions([]);
      setIsSearchboxActive(false);
    }, 100);
  };

  // ✅ handle keyboard submit
  const handleSubmitEditing = () => {
    if (searchInput.trim()) {
      search(searchInput.trim());
      setIsSearchboxActive(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const clearSearch = () => {
    setSearchInput("");
    setFilteredSuggestions([]);
    setIsSearchboxActive(false);
    search("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBoxContainer}>
        <MaterialIcons
          name="search"
          size={22}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          onChangeText={handleInputChange}
          onFocus={handleFocus}
          onSubmitEditing={handleSubmitEditing} // 👈 only here
          value={searchInput}
          style={styles.searchBox}
          placeholder={`Search in ${placeHolder}`}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {searchInput.length > 0 && (
          <MaterialIcons
            name="clear"
            size={20}
            color="#9CA3AF"
            onPress={clearSearch}
            style={styles.clearIcon}
          />
        )}
      </View>

      {isSearchboxActive && searchInput && filteredSuggestions.length > 0 && (
        <View style={styles.dropdownWrapper}>
          <SearchboxDropdown
            search={search}
            suggestions={filteredSuggestions}
            isVisible={true}
            onItemPress={handleSuggestionSelect}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
    marginBottom: 10,
    marginTop: 30,
    marginLeft: 50,
  },
  searchBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 2,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchBox: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#1F2937",
    paddingVertical: 0,
  },
  clearIcon: {
    marginLeft: 8,
    padding: 4,
  },
  dropdownWrapper: {
    position: "absolute",
    top: 70,
    right: 16,
    left: 16,
    zIndex: 1000,
  },
});

export default Searchbox;
