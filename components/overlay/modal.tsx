import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { Surface, useTheme, Portal } from "react-native-paper";
import { useDesign } from "../../contexts/designContext";

type Props = {
  visible: boolean;
  content: React.ReactNode;
  onDismiss: () => void;
  dismissable?: boolean;
};

export function OverlayModal({
  visible,
  content,
  onDismiss,
  dismissable = true,
}: Props) {
  const theme = useTheme();
  const tokens = useDesign();

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: Platform.OS !== 'web',
    }).start(onDismiss);
  };

  if (!visible) return null;

  const backdropOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

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
          justifyContent: "center",
          alignItems: "center",
          padding: tokens.spacing.lg,
        }}
      >
        <TouchableWithoutFeedback onPress={dismissable ? hide : undefined}>
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
          renderToHardwareTextureAndroid
          style={{
            width: "100%",
            maxWidth: 500,
            maxHeight: "85%",
            opacity: animatedValue,
            transform: [{ translateY }],
          }}
        >
          <Surface
            elevation={0}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: tokens.radii["2xl"],
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 24,
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                },
                android: {
                  elevation: 0,
                },
              }),
            }}
          >
            <View
              style={{
                width: "100%",
                overflow: "hidden",
                borderRadius: tokens.radii["2xl"],
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  padding: tokens.spacing.xl,
                }}
              >
                {content}
              </ScrollView>
            </View>
          </Surface>
        </Animated.View>
      </View>
    </Portal>
  );
}
