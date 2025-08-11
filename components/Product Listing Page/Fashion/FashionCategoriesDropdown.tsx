
import { FC } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fashionCategories } from "../../../data";

const FashionCategoriesDropdown: FC = () => {
  return (
    <ScrollView
      style={styles.dropdownContainer}
      contentContainerStyle={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10,
      }}
    >
      {fashionCategories.map((category, index) => {
        return (
          <TouchableOpacity key={index} style={styles.dropdownItem}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderColor: "#e8e8e8",
                // backgroundColor: "#a3fbfb20",
                backgroundColor: "#fff",
                borderWidth: 0.5,
                paddingVertical: 5,
                borderRadius: 10,
              }}
            >
              <Image
                style={styles.dropdownItemImage}
                source={{ uri: category.image }}
              />
              <Text
                style={styles.dropdownItemText}
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

export default FashionCategoriesDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    flex: 1,
    flexDirection: "row",
    columnGap: 10,
    flexWrap: "wrap",
    backgroundColor: "#fff",
    paddingBottom: 10,
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingLeft: 15,
  },
  dropdownItem: {
    color: "#bdbdbd",
    marginVertical: 5,
    borderRadius: 5,
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
  },
});
