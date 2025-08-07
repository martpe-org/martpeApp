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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});

type ImageInterface = {
  source: { uri: string } | number; // Support both URI and local images
  imageStyle?: ImageStyle;
  resizeMode?: ImageResizeMode;
  fallbackSource?: { uri: string } | number; // Custom fallback image
};

const defaultProps = {
  resizeMode: "cover" as ImageResizeMode,
  fallbackSource: { uri: "https://placehold.co/600x400?text=Image+Not+Available" }, // More reliable fallback
};

const ImageComp = (props: ImageInterface & typeof defaultProps) => {
  const { source, imageStyle, resizeMode, fallbackSource } = props;

  const [isLoading, setIsLoading] = useState(
    typeof source === 'object' && source.uri ? true : false
  );
  const [isError, setIsError] = useState(false);

  // Determine the image source
  const getImageSource = () => {
    if (typeof source === 'number') {
      return source; // Local image - return as-is
    }
    
    if (typeof source === 'object' && source.uri && !isError) {
      return source; // Remote URI
    }
    
    // Fallback options in order of preference:
    // 1. Custom fallback from props
    // 2. Default fallback from defaultProps
    return fallbackSource || defaultProps.fallbackSource;
  };

  const handleError = (error: any) => {
    console.log('Image load error:', error);
    if (typeof source === 'object' && source.uri) {
      setIsLoading(false);
      setIsError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={getImageSource()}
        style={[styles.imageStyle, imageStyle]}
        resizeMode={resizeMode}
        onLoadStart={() => {
          if (typeof source === 'object' && source.uri) {
            setIsLoading(true);
            setIsError(false);
          }
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
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