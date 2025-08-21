import { FC } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageComp from "@/components/common/ImageComp";
import { fashionCategories } from "../../../data";

interface FashionCategoriesDropdownProps {
  onSubCategorySelect: (category: string) => void;
  activeCategory: string;
}

const FashionCategoriesDropdown: FC<FashionCategoriesDropdownProps> = ({
  onSubCategorySelect,
  activeCategory
}) => {
  return (
    <ScrollView
      horizontal
      style={styles.dropdownContainer}
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10,
      }}
      showsHorizontalScrollIndicator={false}
    >
      {fashionCategories.map((category, index) => {
        const isActive = activeCategory === category.title;
        return (
          <TouchableOpacity 
            key={index} 
            style={styles.dropdownItem}
            onPress={() => onSubCategorySelect(category.title)}
          >
            <View
              style={[
                styles.dropdownItemContainer,
                { backgroundColor: isActive ? "#007AFF" : "#fff" }
              ]}
            >
              <ImageComp
                source={category.image}
                imageStyle={styles.dropdownItemImage}
                resizeMode="cover"
                fallbackSource={{ uri: "https://via.placeholder.com/25?text=C" }}
                loaderColor="#666"
                loaderSize="small"
              />
              <Text
                style={[
                  styles.dropdownItemText,
                  { color: isActive ? "#fff" : "#000" }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {category?.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 10,
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingLeft: 15,
  },
  dropdownItem: {
    marginVertical: 5,
  },
  dropdownItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#e8e8e8",
    borderWidth: 0.5,
    paddingVertical: 5,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  dropdownItemImage: {
    width: 25,
    height: 25,
    borderRadius: 50,
    marginLeft: 5,
  },
  dropdownItemText: {
    fontSize: 12,
    marginHorizontal: 5,
    minWidth: 60,
  },
});

export default FashionCategoriesDropdown;