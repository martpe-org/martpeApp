import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Animated, 
  Platform,
} from "react-native";
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
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionItem[]>([]);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Process catalog items
  const catalogItems = catalog.map(item => ({
    name: item?.descriptor?.name || "",
    image: item.descriptor.images?.[0] || "",
    id: item.id,
    slug: item.slug || item.id,
  })).filter(item => item.name);

  // Handle search input changes
  useEffect(() => {
    search(searchInput);
    
    if (searchInput.trim()) {
      const filtered = catalogItems.filter((item) =>
        item.name.toLowerCase().includes(searchInput.toLowerCase().trim())
      );
      setFilteredSuggestions(filtered);
      setIsSearchboxActive(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsSearchboxActive(false);
    }
  }, [searchInput]);

  // Handle animation
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isSearchboxActive ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isSearchboxActive]);

  const handleInputChange = (text: string) => {
    setSearchInput(text);
  };

  const handleFocus = () => {
    if (searchInput.trim() && filteredSuggestions.length > 0) {
      setIsSearchboxActive(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsSearchboxActive(false);
    }, 150);
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilteredSuggestions([]);
    setIsSearchboxActive(false);
    search("");
    inputRef.current?.blur();
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    setSearchInput(suggestion.name);
    setFilteredSuggestions([]);
    setIsSearchboxActive(false);
    search(suggestion.name);
    inputRef.current?.blur();
  };

  const animatedStyles = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
    ],
    shadowOpacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.25],
    }),
    elevation: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 8],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchBoxContainer, animatedStyles]}>
        <MaterialIcons 
          name="search" 
          size={22} 
          color="#6B7280" 
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          onChangeText={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={searchInput}
          style={styles.searchBox}
          placeholder={`Search ${placeHolder}`}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          clearButtonMode="while-editing"
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
      </Animated.View>

      {isSearchboxActive && filteredSuggestions.length > 0 && (
        <SearchboxDropdown
          search={search}
          suggestions={filteredSuggestions}
          isVisible={true}
          onItemPress={handleSuggestionSelect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 10,
    marginTop: 30,
    marginLeft:50
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
    fontWeight: '400',
    color: "#1F2937",
    paddingVertical: 0,
  },
  clearIcon: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Searchbox;