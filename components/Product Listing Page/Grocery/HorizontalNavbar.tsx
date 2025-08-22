import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import ImageComp from "../../../components/common/ImageComp";

interface NavbarButton {
  title: string;
  image?: any;
}

interface HorizontalNavbarProps {
  domainColor?: string;
  navbarTitles?: NavbarButton[] | string[];
  onFilterSelect?: (title: string) => void;
  activeCategory?: string;
  hasProducts?: boolean; // ✅ new prop to detect empty category
}

const HorizontalNavbar: React.FC<HorizontalNavbarProps> = ({
  domainColor = "#f14343",
  navbarTitles = [],
  onFilterSelect = () => {},
  activeCategory = "",
  hasProducts = true, // ✅ default true
}) => {
  const buttons = normalizeButtons(navbarTitles);

  return (
    <View>
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
              {renderButtonImage(button, isActive, domainColor)}
              <Text
                style={[
                  navbarStyles.buttonText,
                  isActive && {
                    fontWeight: "bold",
                    color: domainColor,
                  },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {titleText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ✅ Show NoItemsDisplay if no products */}
      {!hasProducts && activeCategory && activeCategory !== "All" && (
        <NoItemsDisplay category={activeCategory} />
      )}
    </View>
  );
};

// ✅ Animated "No Items" Display
const NoItemsDisplay: React.FC<{ category: string }> = ({ category }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        noItemsStyles.container,
        { opacity: fadeAnim, transform: [{ scale: bounceAnim }] },
      ]}
    >
      <Text style={noItemsStyles.emoji}>🛒</Text>
      <Text style={noItemsStyles.title}>No Products Found</Text>
      <Text style={noItemsStyles.subtitle}>
        Nothing available in <Text style={{ fontWeight: "bold" }}>{category}</Text>
      </Text>
    </Animated.View>
  );
};

// --- helper functions moved outside ---
const normalizeButtons = (titles: NavbarButton[] | string[]): NavbarButton[] => {
  if (titles.length === 0) {
    return [
      { title: "Fruits & Vegetables", image: require("../../../assets/headerImage1.png") },
      { title: "Masala & Seasoning", image: require("../../../assets/headerImage2.png") },
      { title: "Oil & Ghee", image: require("../../../assets/headerImage3.png") },
      { title: "Edibles", image: require("../../../assets/headerImage4.png") },
      { title: "Food Grains", image: require("../../../assets/headerImage5.png") },
      { title: "Eggs & Meat", image: require("../../../assets/headerImage6.png") },
    ];
  }
  if (typeof titles[0] === "string") {
    return (titles as string[]).map((title) => ({ title, image: undefined }));
  }
  return titles as NavbarButton[];
};

const renderButtonImage = (button: NavbarButton, isActive: boolean, domainColor: string) => {
  if (button.image) {
    return (
      <View
        style={[
          navbarStyles.imageContainer,
          isActive && { borderWidth: 3, borderColor: domainColor },
        ]}
      >
        <ImageComp
          source={button.image}
          imageStyle={navbarStyles.buttonImage}
          resizeMode="cover"
          loaderColor={domainColor}
          loaderSize="small"
          fallbackSource={{
            uri: `https://via.placeholder.com/55x55/${domainColor.replace(
              "#",
              ""
            )}/${isActive ? "FFFFFF" : "333333"}?text=${encodeURIComponent(
              button.title.charAt(0)
            )}`,
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        navbarStyles.imageContainer,
        navbarStyles.buttonImage,
        {
          backgroundColor: "rgba(0,0,0,0.05)",
          borderWidth: isActive ? 3 : 1,
          borderColor: isActive ? domainColor : "rgba(0,0,0,0.1)",
        },
        isActive && { backgroundColor: domainColor },
      ]}
    >
      <Text
        style={[
          navbarStyles.placeholderText,
          { color: isActive ? "#fff" : domainColor },
        ]}
      >
        {button.title.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

export default HorizontalNavbar;

const navbarStyles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  buttonContainer: {
    alignItems: "center",
    marginRight: 15,
    width: 70,
  },
  imageContainer: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 5,
    backgroundColor:"#f1f1e6"
  },
  buttonImage: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
    lineHeight: 14,
    minHeight: 28,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

const noItemsStyles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
});
