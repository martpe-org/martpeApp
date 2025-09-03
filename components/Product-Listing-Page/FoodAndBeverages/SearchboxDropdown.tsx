import React from "react";
import { View, StyleSheet, ScrollView, Dimensions, TextInput } from "react-native";
import SearchboxDropdownItem from "./SearchboxDropdownItem";

const { height } = Dimensions.get("window");
const MAX_DROPDOWN_HEIGHT = height * 0.4;

interface SuggestionItem {
  image: string;
  name: string;
  id: string;
  slug?: string;
}

interface SearchboxDropdownProps {
  suggestions: SuggestionItem[];
  search: (text: string) => void;
  isVisible: boolean;
  onItemPress?: (suggestion: SuggestionItem) => void;
  inputRef?: React.RefObject<TextInput>; // 👈 accept ref from parent
}

const SearchboxDropdown: React.FC<SearchboxDropdownProps> = ({
  suggestions,
  search,
  onItemPress,
  inputRef,
}) => (
  <View style={styles.dropdownContainer}>
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled" // 👈 important for single tap
      nestedScrollEnabled={true}
    >
      {suggestions.slice(0, 8).map((item, index) => (
        <SearchboxDropdownItem
          search={search}
          key={`${item.id}-${index}`}
          item={item}
          onPress={() => {
            inputRef?.current?.blur(); // 👈 blur input immediately
            onItemPress?.(item);
          }}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.15,
    elevation: 8,
    zIndex: 1000,
    maxHeight: MAX_DROPDOWN_HEIGHT,
  },
  scrollView: {
    maxHeight: MAX_DROPDOWN_HEIGHT,
  },
});

export default SearchboxDropdown;