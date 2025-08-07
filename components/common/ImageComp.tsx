 import  Images  from "../../../assets " ;
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
  },
});

type ImageInterface = {
  source: { uri: string } | number; // Support both URI and local images
  imageStyle?: ImageStyle;
  resizeMode?: ImageResizeMode;
};

const defaultProps = {
  resizeMode: "cover" as ImageResizeMode,
};

const ImageComp = (props: ImageInterface & typeof defaultProps) => {
  const { source, imageStyle, resizeMode } = props;

  const [isLoading, setIsLoading] = useState(
    typeof source === 'object' && source.uri ? true : false
  );
  const [isError, setIsError] = useState(false);

  // Determine the image source
  const getImageSource = () => {
    if (isError) {
      // Use a working placeholder service
      return { uri: "https://picsum.photos/150/150?grayscale" };
    }
    
    if (typeof source === 'object' && source.uri) {
      return source;
    }
    
    if (typeof source === 'number') {
      return source; // Local image
    }
    
    // Default fallback to a working placeholder
    return { uri: "https://picsum.photos/150/150?grayscale" };
  };

  return (
    <View style={styles.container}>
      <Image
        source={getImageSource()}
        style={[styles.imageStyle, imageStyle]}
        resizeMode={resizeMode}
        onLoadStart={() => {
          setIsLoading(true);
          setIsError(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
        onError={({ nativeEvent: { error } }) => {
          console.log('Image load error:', error);
          setIsLoading(false);
          setIsError(true);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
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