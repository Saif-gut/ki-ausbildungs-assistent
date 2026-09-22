import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/store/AppContext';
import { ThemeProvider, useAppTheme } from '@/store/ThemeContext';

function Navigation() {
  const { theme } = useAppTheme();
  return <>
    <StatusBar style={theme.dark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShadowVisible: false, headerTintColor: theme.colors.text, headerStyle: { backgroundColor: theme.colors.background }, headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: theme.colors.background }, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="job/[id]" options={{ title: 'Ausbildungsstelle' }} />
      <Stack.Screen name="chat/[jobId]" options={{ title: 'Ausbildungs-Coach' }} />
      <Stack.Screen name="interview/[jobId]" options={{ title: 'Interviewtraining' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Profil bearbeiten', presentation: 'modal' }} />
    </Stack>
  </>;
}

export default function RootLayout() {
  return <SafeAreaProvider><ThemeProvider><AppProvider><Navigation /></AppProvider></ThemeProvider></SafeAreaProvider>;
}

