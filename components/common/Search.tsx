import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchProps {
  onPress: () => void;
}

export default function Search({ onPress }: SearchProps) {
  const searchTexts = ["grocery", "biryani", "clothing", "electronics"];
  const [searchTextIndex, setSearchTextIndex] = useState(0);
  const words = searchTexts[searchTextIndex].split(" ");
  const wordAnimations = useRef(words.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // animate words when index changes
    wordAnimations.forEach((anim) => anim.setValue(0));
    Animated.stagger(
      150,
      wordAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [searchTextIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchTextIndex((prev) => (prev + 1) % searchTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  });

  return (
    <TouchableOpacity
      style={styles.searchContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Ionicons
        name="search"
        size={20}
        color="#555"
        style={{ marginRight: 8 }}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}>
        <Text style={{ color: "#8E8A8A", fontSize: 16 }}>
          Search for{" "}
        </Text>
        {words.map((word, idx) => (
          <Animated.Text
            key={idx}
            style={{
              opacity: wordAnimations[idx],
              transform: [
                {
                  translateY: wordAnimations[idx].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
              color: "#8E8A8A",
              fontSize: 16,
              marginRight: 4,
            }}
          >
            {word}
          </Animated.Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal:-8,
    marginTop: 10,
  },
});