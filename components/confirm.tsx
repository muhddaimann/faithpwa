import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from "react-native";
import {
  Surface,
  Text,
  Button,
  useTheme,
  Portal,
  Icon,
} from "react-native-paper";
import { useDesign } from "../contexts/designContext";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
};

export function OverlayConfirm({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}: Props) {
  const theme = useTheme();
  const tokens = useDesign();

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const hide = (callback: () => void) => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(callback);
  };

  if (!visible) return null;

  const backdropOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const contentScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const contentTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const accentColor = isDestructive ? theme.colors.error : theme.colors.primary;
  const containerColor = isDestructive
    ? theme.colors.errorContainer
    : theme.colors.primaryContainer;

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
          padding: tokens.spacing.xl,
        }}
      >
        <TouchableWithoutFeedback onPress={() => hide(onCancel)}>
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
            maxWidth: 340,
            opacity: animatedValue,
            transform: [
              { scale: contentScale },
              { translateY: contentTranslateY },
            ],
          }}
        >
          <Surface
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: tokens.radii["2xl"],
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 12 },
                },
              }),
            }}
          >
            <View
              style={{
                borderRadius: tokens.radii["2xl"],
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  paddingTop: tokens.spacing.lg,
                  paddingBottom: tokens.spacing.md,
                  paddingHorizontal: tokens.spacing.md,
                  gap: tokens.spacing.md,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: containerColor,
                    borderWidth: 4,
                    borderColor: theme.colors.surface,
                  }}
                >
                  <Icon
                    source={
                      isDestructive ? "alert-outline" : "help-circle-outline"
                    }
                    size={36}
                    color={accentColor}
                  />
                </View>

                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    gap: tokens.spacing.xs,
                  }}
                >
                  {title && (
                    <Text
                      variant="headlineSmall"
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: theme.colors.onSurface,
                      }}
                    >
                      {title}
                    </Text>
                  )}

                  {message && (
                    <Text
                      variant="bodyMedium"
                      style={{
                        textAlign: "center",
                        lineHeight: 22,
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      {message}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    width: "100%",
                    gap: tokens.spacing.xs,
                  }}
                >
                  <Button
                    mode="contained"
                    onPress={() => hide(onConfirm)}
                    buttonColor={accentColor}
                    textColor={
                      isDestructive
                        ? theme.colors.onError
                        : theme.colors.onPrimary
                    }
                    style={{
                      width: "100%",
                      borderRadius: tokens.radii.pill,
                    }}
                    contentStyle={{
                      paddingVertical: tokens.spacing.xs,
                    }}
                  >
                    {confirmText}
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => hide(onCancel)}
                    textColor={theme.colors.onSurfaceVariant}
                    style={{
                      width: "100%",
                      borderRadius: tokens.radii.pill,
                    }}
                    contentStyle={{
                      paddingVertical: tokens.spacing.xs,
                    }}
                  >
                    {cancelText}
                  </Button>
                </View>
              </View>

              {/* Accent Indicator */}
              <View
                style={{
                  height: 4,
                  width: "100%",
                  backgroundColor: accentColor,
                  opacity: 0.8,
                }}
              />
            </View>
          </Surface>
        </Animated.View>
      </View>
    </Portal>
  );
}
