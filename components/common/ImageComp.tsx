import React, { useState, useMemo } from "react";
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
  source?: { uri?: string } | { url?: string } | string | number | null;
  imageStyle?: ImageStyle;
  resizeMode?: ImageResizeMode;
  fallbackSource?: { uri: string } | number;
};

const defaultProps = {
  resizeMode: "cover" as ImageResizeMode,
//  fallbackSource: require("../../assets/images/no-image.png"),
};

const ImageComp = (props: ImageInterface & typeof defaultProps) => {
  const { source, imageStyle, resizeMode, fallbackSource } = props;

  // Normalize the source so it works for Search, ProductDetails, etc.
  const normalizedSource = useMemo(() => {
    if (!source) return fallbackSource;

    if (typeof source === "string") {
      return source.trim() !== "" ? { uri: source } : fallbackSource;
    }

    if (typeof source === "number") {
      return source;
    }

    if ("uri" in source && source.uri) {
      return { uri: source.uri };
    }

    if ("url" in source && source.url) {
      return { uri: source.url };
    }

    return fallbackSource;
  }, [source, fallbackSource]);

  const [isLoading, setIsLoading] = useState(
    typeof normalizedSource === "object" &&
      normalizedSource !== null &&
      "uri" in normalizedSource &&
      !!normalizedSource.uri
  );
  const [finalSource, setFinalSource] = useState(normalizedSource);
  const [hasErrored, setHasErrored] = useState(false);

  const handleError = () => {
    if (!hasErrored) {
      setHasErrored(true);
      setFinalSource(fallbackSource);
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={finalSource}
        style={[styles.imageStyle, imageStyle]}
        resizeMode={resizeMode}
        onError={handleError}
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
