import React, { useState, useRef, useCallback } from "react";
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
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionItem[]>([]);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Memoize catalog processing to avoid recalculation on every render
  const catalogItems = React.useMemo(() => {
    const addedNames: { [key: string]: boolean } = {};
    const items: SuggestionItem[] = [];
    
    for (const item of catalog) {
      const name = item?.descriptor?.name;
      if (name && !addedNames[name]) {
        addedNames[name] = true;
        items.push({
          name,
          image: item.descriptor.images?.[0] || "",
          id: item.id,
        });
      }
    }
    return items;
  }, [catalog]);

  const handleInputChange = useCallback((text: string) => {
    setSearchInput(text);
    search(text);
    
    if (text.trim()) {
      const filtered = catalogItems.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase().trim())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [catalogItems, search]);

  const handleFocus = useCallback(() => {
    setIsSearchboxActive(true);
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [animatedValue]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsSearchboxActive(false);
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }, 150); // Delay to allow dropdown item press
  }, [animatedValue]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setFilteredSuggestions([]);
    search("");
    inputRef.current?.blur();
  }, [search]);

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

      {isSearchboxActive && searchInput.trim() && (
        <SearchboxDropdown
          search={search}
          suggestions={filteredSuggestions}
          isVisible={filteredSuggestions.length > 0}
          onItemPress={() => {
            setIsSearchboxActive(false);
            inputRef.current?.blur();
          }}
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
    paddingVertical: 0, // Remove default padding
  },
  clearIcon: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Searchbox;