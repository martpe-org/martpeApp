import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, Image, StyleSheet } from "react-native";

const HorizontalNavbar = ({
  domainColor = "#f14343",
  navbarTitles,
  onFilterSelect = () => {},
}) => {
  const defaultButtons = [
    { title: "Fruits & Vegetables", image: require("../../../assets/headerImage1.png") },
    { title: "Masala & Seasoning", image: require("../../../assets/headerImage2.png") },
    { title: "Oil & Ghee", image: require("../../../assets/headerImage3.png") },
    { title: "Edibles", image: require("../../../assets/headerImage4.png") },
    { title: "Food Grains", image: require("../../../assets/headerImage5.png") },
    { title: "Eggs & Meat", image: require("../../../assets/headerImage6.png") },
    { title: "All" },
  ];

  // Normalize titles: always objects with {title, image?}
  const buttons = navbarTitles
    ? navbarTitles.map((item) => (typeof item === "string" ? { title: item } : item))
    : defaultButtons;

  const [selected, setSelected] = useState("All");

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={`${button.title}-${index}`}
          onPress={() => {
            setSelected(button.title);
            onFilterSelect(button.title);
          }}
          style={[styles.buttonContainer, selected === button.title && styles.selectedButton]}
        >
          {button.image && <Image source={button.image} style={styles.buttonImage} />}
          <Text style={styles.buttonText}>
            {button.title.length > 10 ? button.title.slice(0, 10) + "..." : button.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default HorizontalNavbar;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    alignItems: "center",
    marginRight: 15,
    paddingVertical: 5,
  },
  selectedButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#f14343",
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
    maxWidth: 65,
  },
});
