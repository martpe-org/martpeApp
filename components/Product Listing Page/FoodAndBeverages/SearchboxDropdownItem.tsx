import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface SearchboxDropdownItemProps {
  item: {
    image: string;
    name: string;
    id: string;
    slug?: string;
  };
  search: (text: string) => void;
  onPress?: () => void;
  isLast?: boolean;
}

const SearchboxDropdownItem: React.FC<SearchboxDropdownItemProps> = ({
  item,
  search,
  onPress,
  isLast = false,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    try {
      // Call the search function to update the parent state
      search(item.name);
      
      // Call onPress if provided (to close dropdown)
      onPress?.();
      
      // Navigate using slug if available, otherwise use id
      const identifier = item.slug || item.id;
      router.push(`/(tabs)/home/result/productDetails/${identifier}`);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const renderImage = () => {
    if (imageError) {
      return (
        <View style={[styles.itemImg, styles.imagePlaceholder]}>
          <MaterialIcons name="image-not-supported" size={20} color="#9CA3AF" />
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={[styles.itemImg, styles.imagePlaceholder]}>
            <ActivityIndicator size="small" color="#6B7280" />
          </View>
        )}
        <Image
          source={{ uri: item.image }}
          style={[styles.itemImg, imageLoading && styles.hiddenImage]}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.dropdownItemContainer,
        !isLast && styles.borderBottom,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownItem}>
        {renderImage()}
        <View style={styles.textContainer}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </View>
      
      <MaterialIcons 
        name="arrow-forward-ios" 
        size={16} 
        color="#9CA3AF" 
        style={styles.linkIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  itemImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  hiddenImage: {
    position: 'absolute',
    opacity: 0,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 20,
  },
  linkIcon: {
    marginLeft: 8,
  },
});

export default SearchboxDropdownItem;