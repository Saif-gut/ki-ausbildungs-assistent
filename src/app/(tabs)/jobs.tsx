import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { JobCard } from '@/components/JobCard';
import { PageHeader } from '@/components/ui';
import { jobs } from '@/data/jobs';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';

const filters = ['Alle', 'IT', 'Handel', 'Technik'];

export default function JobsScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Alle');
  const { savedJobIds } = useApp();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const filtered = useMemo(() => jobs.filter((job) => {
    const matchesText = `${job.title} ${job.company} ${job.location} ${job.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (filter === 'Alle' || job.tags.includes(filter));
  }), [query, filter]);
  return <Screen wide>
    <PageHeader eyebrow="Ausbildungsstellen" title="Finde, was zu dir passt" subtitle="Übersichtliche Informationen und ein transparenter Vergleich mit deinem Profil." />
    <View style={styles.tools}><View style={styles.search}><Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} /><TextInput accessibilityLabel="Ausbildungsstellen durchsuchen" value={query} onChangeText={setQuery} placeholder="Beruf, Unternehmen oder Ort" placeholderTextColor={theme.colors.textTertiary} style={styles.input} />{query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color={theme.colors.textTertiary} /></Pressable> : null}</View><View style={styles.filters}>{filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}><Text style={[styles.filterText, filter === item && styles.activeFilterText]}>{item}</Text></Pressable>)}</View></View>
    <View style={styles.resultRow}><Text style={styles.result}>{filtered.length} passende Stellen</Text><Text style={styles.saved}>{savedJobIds.length} gespeichert</Text></View>
    <View style={[styles.grid, width >= 980 && styles.desktopGrid]}>{filtered.map((job) => <View key={job.id} style={width >= 980 ? styles.gridItem : undefined}><JobCard job={job} /></View>)}</View>
    {!filtered.length && <View style={styles.none}><Ionicons name="search-outline" size={25} color={theme.colors.textTertiary} /><Text style={styles.noneTitle}>Keine passenden Stellen</Text><Text style={styles.noneText}>Versuche einen anderen Suchbegriff oder entferne den Filter.</Text></View>}
    <View style={styles.sourceNote}><Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} /><Text style={styles.sourceText}>Aktuell werden gekennzeichnete Beispieldaten gezeigt. Angaben vor einer Bewerbung an der Originalquelle prüfen.</Text></View>
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  tools: { gap: 12, marginBottom: 22 }, search: { height: 56, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 }, input: { flex: 1, fontSize: 15, color: theme.colors.text },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, filter: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingVertical: 9, paddingHorizontal: 15, borderRadius: theme.radius.pill }, activeFilter: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, filterText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }, activeFilterText: { color: theme.colors.white },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }, result: { color: theme.colors.text, fontSize: 14, fontWeight: '700' }, saved: { color: theme.colors.textSecondary, fontSize: 12 },
  grid: {}, desktopGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, gridItem: { width: '48.9%' },
  none: { alignItems: 'center', paddingVertical: 54, gap: 7 }, noneTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' }, noneText: { color: theme.colors.textSecondary, fontSize: 13, textAlign: 'center' },
  sourceNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 8, padding: 14, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted }, sourceText: { flex: 1, color: theme.colors.textSecondary, fontSize: 11, lineHeight: 17 },
});
