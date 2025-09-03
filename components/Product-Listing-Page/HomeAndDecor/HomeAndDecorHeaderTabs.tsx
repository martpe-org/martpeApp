import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import ImageComp from "../../common/ImageComp";

interface HeaderTabButtonProps {
  onClick: (title: string) => void;
  activeButton: string;
  title: string;
  imageSource: string;
}

interface TabData {
  title: string;
  image: string;
}

interface HomeAndDecorHeaderTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const HomeAndDecorHeaderTabs: React.FC<HomeAndDecorHeaderTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  // Define different images for each tab
  const data: TabData[] = [
    {
      title: "Decor",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    },
    {
      title: "Furniture",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150&h=150&fit=crop&crop=center",
    },
    {
      title: "Furnishing",
      image:
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=150&h=150&fit=crop&crop=center",
    },
    {
      title: "Cooking",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop&crop=center",
    },
    {
      title: "Garden",
      image:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop&crop=center",
    },
  ];

  function handleActiveButton(title: string) {
    if (activeTab === title) {
      onTabChange("All");
    } else {
      onTabChange(title);
    }
  }

  return (
    <LinearGradient
      colors={[
        "rgba(255, 231, 165, 0.4)",
        "rgba(255, 231, 165, 0.2)",
        "rgba(255, 231, 165, 0.1)",
      ]}
      start={[0, 0]}
      end={[0, 1]}
      style={{ borderRadius: 15, marginHorizontal: 10 }}
    >
      <ScrollView
        style={styles.headerButtonsContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {data.map((item) => (
          <HeaderTabButton
            key={item.title}
            activeButton={activeTab}
            onClick={handleActiveButton}
            title={item.title}
            imageSource={item.image}
          />
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const HeaderTabButton: React.FC<HeaderTabButtonProps> = ({
  onClick,
  activeButton,
  title,
  imageSource,
}) => (
  <TouchableOpacity
    onPress={() => onClick(title)}
    style={styles.headerTabButton}
    activeOpacity={0.7}
  >
    <ImageComp
      source={imageSource}
      imageStyle={[
        styles.headerTabButtonImage,
        {
          borderColor: title === activeButton ? "#FDD059" : "transparent",
        },
      ]}
      resizeMode="cover"
      loaderColor="#FDD059"
      loaderSize="small"
      fallbackSource={{
        uri:
          "https://via.placeholder.com/60x60/FDD059/FFFFFF?text=" +
          encodeURIComponent(title.charAt(0)),
      }}
    />
    <Text
      style={[
        styles.headerButtonText,
        {
          fontWeight: title === activeButton ? "bold" : "normal",
        },
      ]}
    >
      {title.length > 7 ? title.slice(0, 7) + "..." : title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerButtonsContainer: {
    paddingHorizontal: 5,
  },
  headerTabButton: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: "center",
  },
  headerTabButtonImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  headerButtonText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    maxWidth: 70,
  },
});

export default HomeAndDecorHeaderTabs;
