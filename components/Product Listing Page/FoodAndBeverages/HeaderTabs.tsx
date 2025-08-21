import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";

interface HeaderTabsProps {
  buttonTitles: string[];
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ buttonTitles }) => {
  const [activeButton, setActiveButton] = useState<string>("");

  function handleClick(title: string) {
    setActiveButton(title);
  }

  return (
    <View style={styles.button_container}>
      {buttonTitles.map((button, idx) => (
        <FilterButton
          key={`${button}-${idx}`} // unique key
          handleClick={handleClick}
          title={button}
          activeButton={activeButton}
        />
      ))}
    </View>
  );
};

interface FilterButtonProps {
  title: string;
  handleClick: (title: string) => void;
  activeButton: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  title,
  handleClick,
  activeButton,
}) => {
  const titleColor = title === "Veg" ? "#00b14f" : "#ff0000";
  const bgColor = title === "Veg" ? "#00b14f" : "#ff0000";
  const isActive = activeButton === title;

  return (
    <TouchableOpacity
      onPress={() => handleClick(title)}
      style={{
        ...styles.button,
        borderColor: isActive ? bgColor : titleColor,
        backgroundColor: isActive ? bgColor : "#ffffff",
      }}
    >
      <Text
        style={{
          ...styles.button_text,
          color: isActive ? "#ffffff" : titleColor,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginHorizontal: 10,
    borderBottomColor: "#e5e5e5",
  },
  button: {
    padding: 5,
    paddingHorizontal: Dimensions.get("window").width * 0.05,
    borderRadius: 100,
    borderWidth: 1,
  },
  button_text: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default HeaderTabs;
