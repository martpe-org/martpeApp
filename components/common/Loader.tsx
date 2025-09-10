import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

interface LoaderProps {
  size?: "small" | "large";
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = "small", color = "red" }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;
