import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import HorizontalNavbar from "../Grocery/HorizontalNavbar";
import PersonalCareCardContainer from "./PersonalCareCardContainer";

interface CatalogItem {
  bpp_id: string;
  bpp_uri: string;
  catalog_id: string;
  category_id: string;
  descriptor: {
    images: string[];
    long_desc: string;
    name: string;
    short_desc: string;
    symbol: string;
  };
  id: string;
  location_id: string;
  non_veg: any;
  price: {
    maximum_value: number;
    offer_percent: any;
    offer_value: any;
    value: number;
  };
  provider_id: string;
  quantity: {
    available: any;
    maximum: any;
  };
  veg: any;
}

interface PLPPersonalCareProps {
  catalog: CatalogItem[];
  sidebarTitles: string[];
  providerId: string | string[];
  searchString: string;
}

const PLPPersonalCare: React.FC<PLPPersonalCareProps> = ({
  catalog,
  sidebarTitles,
  providerId,
  searchString,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleCategorySelect = (category: string) => {
    console.log("Selected category:", category);
    setSelectedCategory(category);
  };

  // Remove duplicates from buttons array
  const buttons = [
    {
      title: "All",
    },
    {
      title: "Bath & Body",
      image: require("../../../assets/bpcHeaderImage1.png"),
    },
    {
      title: "Feminine Care",
      image: require("../../../assets/bpcHeaderImage2.png"),
    },
    {
      title: "Fragnance",
      image: require("../../../assets/bpcHeaderImage3.png"),
    },
    {
      title: "Hair Care",
      image: require("../../../assets/bpcHeaderImage4.png"),
    },
    {
      title: "Oral Care",
      image: require("../../../assets/bpcHeaderImage5.png"),
    },
    {
      title: "Make Up",
      image: require("../../../assets/bpcHeaderImage6.png"),
    },
    {
      title: "Skin Care",
      image: require("../../../assets/bpcHeaderImage1.png"),
    },
  ];

  return (
    <View style={styles.container}>
      <HorizontalNavbar
        navbarTitles={buttons}
        domainColor="rgba(255, 211, 237, 1)"
        onFilterSelect={handleCategorySelect}
      />

      <PersonalCareCardContainer
        searchString={searchString}
        providerId={providerId}
        catalog={catalog}
        selectedCategory={selectedCategory}
      />
    </View>
  );
};

export default PLPPersonalCare;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});