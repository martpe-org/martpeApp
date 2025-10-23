import React, { useRef } from "react";
import { View, Image, Dimensions } from "react-native";
import { TapGestureHandler, PanGestureHandler, PinchGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface ZoomableImageProps {
  uri: string;
  isActive: boolean;
  onZoomChange: (zoomed: boolean) => void;
}

const DOUBLE_TAP_SCALE = 2;

const ZoomableImage: React.FC<ZoomableImageProps> = ({ uri, isActive, onZoomChange }) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchRef = useRef();
  const panRef = useRef();
  const doubleTapRef = useRef();

  // Pinch gesture
  const pinchHandler = useAnimatedGestureHandler({
    onStart: (event, ctx: any) => { ctx.startScale = scale.value; },
    onActive: (event, ctx: any) => { 
      const newScale = Math.max(1, Math.min(ctx.startScale * event.scale, 3));
      scale.value = newScale;
      runOnJS(onZoomChange)(newScale > 1); // Call only when active
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        runOnJS(onZoomChange)(false);
      }
    },
  });

  // Pan gesture
  const panHandler = useAnimatedGestureHandler({
    onStart: (event, ctx: any) => { ctx.startX = translateX.value; ctx.startY = translateY.value; },
    onActive: (event, ctx: any) => {
      if (scale.value > 1) {
        const maxX = (width * scale.value - width) / 2;
        const maxY = (height * scale.value - height) / 2;
        translateX.value = Math.max(-maxX, Math.min(maxX, ctx.startX + event.translationX));
        translateY.value = Math.max(-maxY, Math.min(maxY, ctx.startY + event.translationY));
      }
    },
  });

  // Double tap to zoom
  const doubleTapHandler = useAnimatedGestureHandler({
    onActive: () => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        runOnJS(onZoomChange)(false);
      } else {
        scale.value = withSpring(DOUBLE_TAP_SCALE);
        runOnJS(onZoomChange)(true);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
      <TapGestureHandler
        ref={doubleTapRef}
        onGestureEvent={doubleTapHandler}
        numberOfTaps={2}
      >
        <Animated.View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={panHandler}
            simultaneousHandlers={[pinchRef, doubleTapRef]}
            minPointers={1}
            maxPointers={1}
            enabled={isActive}
          >
            <Animated.View style={{ justifyContent: "center", alignItems: "center" }}>
              <PinchGestureHandler
                ref={pinchRef}
                onGestureEvent={pinchHandler}
                simultaneousHandlers={[panRef, doubleTapRef]}
                enabled={isActive}
              >
                <Animated.View style={[animatedStyle, { justifyContent: "center", alignItems: "center" }]}>
                  <Image
                    source={{ uri }}
                    style={{ width, height, marginBottom:190 }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
};

export default ZoomableImage;
