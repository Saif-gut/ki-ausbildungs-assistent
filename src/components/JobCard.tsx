import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Job } from '@/types';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { Badge, Card, IconButton } from '@/components/ui';
import { AppTheme } from '@/theme';
import { useMemo } from 'react';

export function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  const { savedJobIds, toggleSaved } = useApp();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const saved = savedJobIds.includes(job.id);
  const keyRequirements = job.requirements.slice(0, compact ? 2 : 3);
  return <Pressable onPress={() => router.push(`/job/${job.id}`)} style={({ pressed }) => pressed && { opacity: 0.82 }}>
    <Card style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.top}>
        <View style={[styles.logo, { backgroundColor: theme.dark ? theme.colors.primarySoft : job.color }]}><Text style={styles.logoText}>{job.logo}</Text></View>
        <View style={styles.titleWrap}><Text style={styles.title}>{job.title}</Text><Text style={styles.company}>{job.company}</Text></View>
        <IconButton icon={saved ? 'bookmark' : 'bookmark-outline'} selected={saved} label={saved ? 'Stelle nicht mehr speichern' : 'Stelle speichern'} onPress={(event) => { event.stopPropagation(); toggleSaved(job.id); }} />
      </View>
      <View style={styles.metaRow}><View style={styles.metaItem}><Ionicons name="location-outline" size={15} color={theme.colors.textSecondary} /><Text style={styles.metaText}>{job.location} · {job.distance}</Text></View><View style={styles.metaItem}><Ionicons name="calendar-clear-outline" size={15} color={theme.colors.textSecondary} /><Text style={styles.metaText}>ab {job.start}</Text></View></View>
      {!compact && <View style={styles.requirements}><Text style={styles.requirementLabel}>Wichtige Voraussetzungen</Text>{keyRequirements.map((item) => <View key={item.label} style={styles.requirement}><View style={[styles.dot, { backgroundColor: item.state === 'met' ? theme.colors.success : item.state === 'open' ? theme.colors.warning : theme.colors.danger }]} /><Text numberOfLines={1} style={styles.requirementText}>{item.label}</Text></View>)}</View>}
      <View style={styles.footer}><View style={styles.tags}>{job.tags.slice(0, 2).map((tag) => <Badge key={tag}>{tag}</Badge>)}{saved && <Badge tone="primary" icon="bookmark">Gespeichert</Badge>}</View><View style={styles.details}><Text style={styles.detailsText}>Details</Text><Ionicons name="arrow-forward" size={16} color={theme.colors.primary} /></View></View>
    </Card>
  </Pressable>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { marginBottom: 14, padding: 20 }, compactCard: { minHeight: 0 },
  top: { flexDirection: 'row', gap: 13, alignItems: 'flex-start' }, logo: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, logoText: { color: theme.colors.primaryStrong, fontSize: 14, fontWeight: '800' },
  titleWrap: { flex: 1, gap: 4, paddingTop: 1 }, title: { fontSize: 17, lineHeight: 22, color: theme.colors.text, fontWeight: '800', letterSpacing: -0.2 }, company: { color: theme.colors.textSecondary, fontSize: 13 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 17 }, metaItem: { flexDirection: 'row', gap: 5, alignItems: 'center' }, metaText: { color: theme.colors.textSecondary, fontSize: 12 },
  requirements: { marginTop: 17, padding: 14, borderRadius: 13, backgroundColor: theme.colors.primarySubtle, gap: 8 }, requirementLabel: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 1 }, requirement: { flexDirection: 'row', alignItems: 'center', gap: 8 }, dot: { width: 7, height: 7, borderRadius: 4 }, requirementText: { color: theme.colors.text, fontSize: 12, flex: 1 },
  footer: { borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 17, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, tags: { flex: 1, flexDirection: 'row', gap: 6, flexWrap: 'wrap' }, details: { flexDirection: 'row', gap: 5, alignItems: 'center' }, detailsText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
});
