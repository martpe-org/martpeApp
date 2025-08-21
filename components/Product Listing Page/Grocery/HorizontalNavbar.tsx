import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  View,
} from "react-native";

interface NavbarButton {
  title: string;
  image?: any; // require() or { uri: string }
}

interface HorizontalNavbarProps {
  domainColor?: string;
  navbarTitles?: NavbarButton[] | string[]; // Accept both formats
  onFilterSelect?: (title: string) => void;
  activeCategory?: string;
}

const HorizontalNavbar: React.FC<HorizontalNavbarProps> = ({
  domainColor = "#f14343",
  navbarTitles = [],
  onFilterSelect = () => {},
  activeCategory = "",
}) => {
  // Convert navbarTitles to consistent format
  const normalizeButtons = (titles: NavbarButton[] | string[]): NavbarButton[] => {
    if (titles.length === 0) {
      // Default fallback
      return [
        {
          title: "Fruits & Vegetables",
          image: require("../../../assets/headerImage1.png"),
        },
        {
          title: "Masala & Seasoning",
          image: require("../../../assets/headerImage2.png"),
        },
        {
          title: "Oil & Ghee",
          image: require("../../../assets/headerImage3.png"),
        },
        {
          title: "Edibles",
          image: require("../../../assets/headerImage4.png"),
        },
        {
          title: "Food Grains",
          image: require("../../../assets/headerImage5.png"),
        },
        {
          title: "Eggs & Meat",
          image: require("../../../assets/headerImage6.png"),
        },
      ];
    }

    // Check if it's an array of strings
    if (typeof titles[0] === 'string') {
      return (titles as string[]).map((title) => ({
        title,
        // You can add default images or leave undefined
        image: undefined,
      }));
    }

    // It's already in the correct format
    return titles as NavbarButton[];
  };

  const buttons = normalizeButtons(navbarTitles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={navbarStyles.scrollContainer}
      contentContainerStyle={navbarStyles.scrollContent}
    >
      {buttons.map((button, index) => {
        const titleText =
          typeof button.title === "string"
            ? button.title.length > 12
              ? button.title.slice(0, 12) + "..."
              : button.title
            : "";

        const isActive = activeCategory === button.title;

        return (
          <TouchableOpacity
            key={`${button.title}-${index}`}
            onPress={() => onFilterSelect(button.title)}
            style={navbarStyles.buttonContainer}
            activeOpacity={0.7}
          >
            {button.image ? (
              <Image 
                source={button.image} 
                style={[
                  navbarStyles.buttonImage,
                  isActive && {
                    borderWidth: 3,
                    borderColor: domainColor,
                  }
                ]} 
              />
            ) : (
              <View 
                style={[
                  navbarStyles.buttonImage, 
                  { backgroundColor: domainColor.replace('1)', '0.3)') }, // Make background lighter
                  isActive && {
                    borderWidth: 3,
                    borderColor: domainColor,
                    backgroundColor: domainColor,
                  }
                ]} 
              >
                <Text style={[
                  navbarStyles.placeholderText,
                  { color: isActive ? '#fff' : domainColor }
                ]}>
                  {button.title.charAt(0)}
                </Text>
              </View>
            )}
            <Text 
              style={[
                navbarStyles.buttonText,
                isActive && { 
                  fontWeight: "bold", 
                  color: domainColor 
                }
              ]}
            >
              {titleText}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default HorizontalNavbar;

const navbarStyles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  buttonContainer: {
    alignItems: "center",
    marginRight: 15,
  },
  buttonImage: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginBottom: 5,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 70,
    color:"black"
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});