import PropTypes from "prop-types";
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  View,
} from "react-native";

const HorizontalNavbar = ({
  domainColor = "#f14343",
  navbarTitles = [],
  onFilterSelect = () => {},
}) => {
  // ✅ Default fallback if no navbarTitles provided
  const buttons =
    navbarTitles.length > 0
      ? navbarTitles
      : [
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      {buttons.map((button, index) => {
        const titleText =
          typeof button.title === "string"
            ? button.title.length > 12
              ? button.title.slice(0, 12) + "..."
              : button.title
            : ""; // ✅ prevent objects being rendered

        return (
          <TouchableOpacity
            key={`${button.title}-${index}`}
            onPress={() => onFilterSelect(button.title)}
            style={styles.buttonContainer}
            activeOpacity={0.7}
          >
            {button.image ? (
              <Image source={button.image} style={styles.buttonImage} />
            ) : (
              <View style={[styles.buttonImage, { backgroundColor: domainColor }]} />
            )}
            <Text style={styles.buttonText}>{titleText}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

HorizontalNavbar.propTypes = {
  domainColor: PropTypes.string,
  navbarTitles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      image: PropTypes.oneOfType([
        PropTypes.number, // require(...)
        PropTypes.shape({ uri: PropTypes.string }), // { uri: "https://..." }
      ]),
    })
  ),
  onFilterSelect: PropTypes.func,
};

export default HorizontalNavbar;

const styles = StyleSheet.create({
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
    backgroundColor: "#f0f0f0",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 70,
  },
});
