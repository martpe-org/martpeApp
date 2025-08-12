import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleSheet,
  View,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  imageStyle: {
    height: "auto",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});

type ImageInterface = {
  source: { uri: string } | number;
  imageStyle?: ImageStyle;
  resizeMode?: ImageResizeMode;
  fallbackSource?: { uri: string } | number;
};

const defaultProps = {
  resizeMode: "cover" as ImageResizeMode,
  fallbackSource: require("../../assets/images/no-image.png"), // use PNG for compatibility
};

const ImageComp = (props: ImageInterface & typeof defaultProps) => {
  const { source, imageStyle, resizeMode, fallbackSource } = props;

  const [isLoading, setIsLoading] = useState(
    typeof source === "object" && !!source.uri
  );
  const [finalSource, setFinalSource] = useState(source);
  const [hasErrored, setHasErrored] = useState(false);

  const handleError = () => {
    // Prevent infinite loop if fallback also fails
    if (!hasErrored) {
      setHasErrored(true);
      setFinalSource(fallbackSource || defaultProps.fallbackSource);
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={finalSource}
        style={[styles.imageStyle, imageStyle]}
        resizeMode={resizeMode}
        onError={handleError} // No console.log to keep terminal clean
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="black" />
        </View>
      )}
    </View>
  );
};

ImageComp.defaultProps = defaultProps;

export default ImageComp;
