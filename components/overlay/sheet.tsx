import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
} from "react-native";
import { Portal, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../contexts/designContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

type Props = {
  visible: boolean;
  title?: string;
  content: React.ReactNode;
  onDismiss: () => void;
};

export function OverlaySheet({ visible, title, content, onDismiss }: Props) {
  const theme = useTheme();
  const tokens = useDesign();
  const insets = useSafeAreaInsets();

  // Local state to track if we should actually render the component
  // This allows us to keep it in the DOM during the exit animation
  const [shouldRender, setShouldRender] = React.useState(visible);

  const pan = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const maxSheetHeight = SCREEN_HEIGHT - insets.top - tokens.spacing.md;

  const show = () => {
    setShouldRender(true);
    Animated.parallel([
      Animated.spring(pan, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const hide = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(pan, {
        toValue: SCREEN_HEIGHT,
        duration: 200, // Slightly longer for smoother exit
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setShouldRender(false);
      callback?.();
      pan.setValue(SCREEN_HEIGHT);
    });
  };

  useEffect(() => {
    if (visible) {
      show();
    } else if (shouldRender) {
      // If prop changed to false but we are still rendering, trigger animation
      hide();
    }
  }, [visible]);

  const handleManualDismiss = () => {
    // This is for backdrop taps or swipes
    hide(onDismiss);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 5 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 0.5) {
          handleManualDismiss();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },
    }),
  ).current;

  if (!shouldRender && !visible) return null;

  return (
    <Portal>
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          justifyContent: "flex-end",
        }}
      >
        <TouchableWithoutFeedback onPress={handleManualDismiss}>
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: theme.colors.backdrop,
              opacity: backdropOpacity,
            }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          {...panResponder.panHandlers}
          renderToHardwareTextureAndroid
          style={{
            width: "100%",
            transform: [{ translateY: pan }],
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: tokens.radii["2xl"],
              borderTopRightRadius: tokens.radii["2xl"],
              overflow: "hidden",
              paddingBottom: 1000,
              marginBottom: -1000,

              ...(Platform.OS === "ios"
                ? {
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 24,
                    shadowOffset: {
                      width: 0,
                      height: -8,
                    },
                  }
                : {
                    elevation: 0,
                  }),
            }}
          >
            <View
              style={{
                maxHeight: maxSheetHeight,
              }}
            >
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  paddingTop: tokens.spacing.md,
                  paddingBottom: tokens.spacing.sm,
                  gap: tokens.spacing.md,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 5,
                    borderRadius: tokens.radii.full,
                    backgroundColor: theme.colors.outlineVariant,
                  }}
                />

                {title && (
                  <Text
                    variant="titleLarge"
                    style={{
                      fontWeight: "700",
                      color: theme.colors.onSurface,
                    }}
                  >
                    {title}
                  </Text>
                )}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                scrollEventThrottle={16}
                contentContainerStyle={{
                  paddingHorizontal: tokens.spacing.xl,
                  paddingBottom: tokens.spacing.xl + insets.bottom,
                }}
              >
                <TouchableWithoutFeedback>
                  <View>{content}</View>
                </TouchableWithoutFeedback>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </View>
    </Portal>
  );
}
