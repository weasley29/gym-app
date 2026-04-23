import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../src/theme';
import BackButton from '../src/BackButton';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerBackTitle: ' ',
          headerLeft: () => <BackButton />,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerLeft: undefined }} />
        <Stack.Screen name="category/[id]" options={{ title: 'Category' }} />
        <Stack.Screen name="exercise/[id]" options={{ title: 'Exercise' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
