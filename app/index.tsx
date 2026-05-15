import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import { useDesign } from "../contexts/designContext";
import { useAuth } from "../contexts/authContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const theme = useTheme();
  const tokens = useDesign();
  const { signIn, user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(tabs)/home");
    }
  }, [user, isLoading]);

  const handleLogin = async () => {
    await signIn(username.trim(), password);
  };

  const renderContent = () => (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: tokens.spacing.xl,
        }}
      >
        <Card
          mode="elevated"
          style={{
            backgroundColor: theme.colors.surface,
            padding: tokens.spacing.xl,
            borderRadius: tokens.radii.xl,
            elevation: 4,
          }}
        >
          <View style={{ marginBottom: tokens.spacing.xl }}>
            <Text
              variant="headlineMedium"
              style={{
                fontWeight: "700",
                textAlign: "center",
                marginBottom: tokens.spacing.xs,
              }}
            >
              Welcome Back
            </Text>

            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                opacity: 0.6,
              }}
            >
              Sign in to continue
            </Text>
          </View>

          <TextInput
            label="Username"
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="account-outline" />}
            returnKeyType="next"
          />

          <TextInput
            label="Password"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ marginTop: tokens.spacing.md }}
            left={<TextInput.Icon icon="lock-outline" />}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <View style={{ height: tokens.spacing.md }} />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={{
              borderRadius: tokens.radii.pill,
              paddingVertical: 4,
            }}
            contentStyle={{ paddingVertical: 6 }}
            disabled={!username || !password}
          >
            Login
          </Button>
        </Card>
      </KeyboardAvoidingView>
    </View>
  );

  if (Platform.OS === "web") {
    return renderContent();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {renderContent()}
    </TouchableWithoutFeedback>
  );
}
