import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAppTheme } from '@/store/ThemeContext';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline', jobs: 'search-outline', coach: 'chatbubble-ellipses-outline', applications: 'briefcase-outline', profile: 'person-outline',
};

export default function TabLayout() {
  const { theme } = useAppTheme();
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textTertiary,
    tabBarStyle: { height: 76, paddingTop: 9, paddingBottom: 10, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? (icons[route.name]?.replace('-outline', '') as keyof typeof Ionicons.glyphMap) : icons[route.name] ?? 'ellipse-outline'} color={color} size={size} />,
    sceneStyle: { backgroundColor: theme.colors.background },
  })}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="jobs" options={{ title: 'Stellen' }} />
    <Tabs.Screen name="coach" options={{ title: 'KI-Coach' }} />
    <Tabs.Screen name="applications" options={{ title: 'Bewerbungen' }} />
    <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    <Tabs.Screen name="documents" options={{ href: null }} />
  </Tabs>;
}
