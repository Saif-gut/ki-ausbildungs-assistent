import { PropsWithChildren, useMemo } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';

export function Screen({ children, scrollProps, wide = false }: PropsWithChildren<{ scrollProps?: ScrollViewProps; wide?: boolean }>) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <SafeAreaView edges={['top']} style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} {...scrollProps}><View style={[styles.inner, wide && styles.wide]}>{children}</View></ScrollView></SafeAreaView>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.background }, content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }, inner: { width: '100%', maxWidth: 800, alignSelf: 'center' }, wide: { maxWidth: 1120 } });
