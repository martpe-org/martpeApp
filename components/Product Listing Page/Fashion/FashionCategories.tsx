import { useState, FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageComp from "@/components/common/ImageComp";
import FashionCategoriesDropdown from "./FashionCategoriesDropdown";
import { fashionHeaderData } from "../../../data";

interface FashionCategoriesButtonProps {
  headerTitle: string;
  image: string;
  onClick: () => void;
  isActive: boolean;
}

interface FashionCategoriesProps {
  onCategorySelect: (category: string) => void;
  activeCategory: string;
}

const FashionCategoriesButton: FC<FashionCategoriesButtonProps> = ({
  headerTitle,
  image,
  onClick,
  isActive,
}) => {
  return (
    <TouchableOpacity
      style={{
        ...styles.fashionCategoriesButton,
        backgroundColor: isActive ? "#007AFF" : "#fff",
      }}
      onPress={onClick}
    >
      <ImageComp
        source={image}
        imageStyle={styles.fashionCategoriesButtonImage}
        resizeMode="cover"
        fallbackSource={{ uri: "https://via.placeholder.com/50?text=Cat" }}
        loaderColor="#666"
        loaderSize="small"
      />
      <Text 
        style={[
          styles.fashionCategoriesButtonText,
          { color: isActive ? "#fff" : "#000" }
        ]}
      >
        {headerTitle.length > 7 ? headerTitle.slice(0, 7) : headerTitle}
      </Text>
    </TouchableOpacity>
  );
};

const FashionCategories: FC<FashionCategoriesProps> = ({ 
  onCategorySelect, 
  activeCategory 
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  function handleCategoryClick(headerTitle: string) {
    onCategorySelect(headerTitle);
    setShowDropdown(headerTitle !== "All");
  }

  return (
    <View
      style={{ borderBottomWidth: 1, borderColor: "#e8e8e8", marginBottom: 10 }}
    >
      <View style={styles.fashionCategoriesButtonContainer}>
        {fashionHeaderData.map((header) => (
          <FashionCategoriesButton
            key={header.title}
            image={header.image}
            headerTitle={header.title}
            isActive={activeCategory === header.title}
            onClick={() => handleCategoryClick(header.title)}
          />
        ))}
      </View>
      {showDropdown && activeCategory !== "All" && (
        <FashionCategoriesDropdown 
          onSubCategorySelect={onCategorySelect}
          activeCategory={activeCategory}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fashionCategoriesButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  fashionCategoriesButton: {
    alignItems: "center",
    paddingBottom: 10,
    overflow: "hidden",
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  fashionCategoriesButtonImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
  },
  fashionCategoriesButtonText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 5,
  },
});

export default FashionCategories;