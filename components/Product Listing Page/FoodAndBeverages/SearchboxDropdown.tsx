import React, { useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  Dimensions,
  Platform,
  Text
} from "react-native";
import SearchboxDropdownItem from "./SearchboxDropdownItem";

const { height } = Dimensions.get('window');
const MAX_DROPDOWN_HEIGHT = height * 0.4; // 40% of screen height

interface SuggestionItem {
  image: string;
  name: string;
  id: string;
}

interface SearchboxDropdownProps {
  suggestions: SuggestionItem[];
  search: (text: string) => void;
  isVisible: boolean;
  onItemPress?: () => void;
}

const SearchboxDropdown: React.FC<SearchboxDropdownProps> = ({
  suggestions,
  search,
  isVisible,
  onItemPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.dropdownContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {suggestions.length > 0 ? (
          suggestions.slice(0, 8).map((item, index) => (
            <SearchboxDropdownItem
              key={`${item.id}-${index}`}
              search={search}
              item={item}
              onPress={onItemPress}
              isLast={index === Math.min(suggestions.length - 1, 7)}
            />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )}
        
        {suggestions.length > 8 && (
          <View style={styles.moreResultsContainer}>
            <Text style={styles.moreResultsText}>
              +{suggestions.length - 8} more results
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    maxHeight: MAX_DROPDOWN_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    shadowOpacity: 0.15,
    elevation: 8,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scrollView: {
    maxHeight: MAX_DROPDOWN_HEIGHT,
  },
  noResultsContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: '500',
  },
  moreResultsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
  },
  moreResultsText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: '500',
  },
});

export default SearchboxDropdown;