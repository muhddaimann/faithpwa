import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "" }} />
      <Stack.Screen name="main" options={{ title: "" }} />
      <Stack.Screen name="attendance" options={{ title: "" }} />
      <Stack.Screen name="leave" options={{ title: "" }} />
      <Stack.Screen name="newsflash" options={{ title: "" }} />
      <Stack.Screen name="room" options={{ title: "" }} />
    </Stack>
  );
}
