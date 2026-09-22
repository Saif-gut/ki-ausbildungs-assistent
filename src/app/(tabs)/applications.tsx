import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { getJob } from '@/data/jobs';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';
import { ApplicationStatus } from '@/types';

const statuses: ApplicationStatus[] = ['Entwurf', 'Bewerbung fertig', 'Gesendet', 'Vorstellungsgespräch', 'Zusage', 'Absage'];
const tones: Record<ApplicationStatus, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'> = {
  Entwurf: 'neutral', 'Bewerbung fertig': 'primary', Gesendet: 'primary', Vorstellungsgespräch: 'warning', Zusage: 'success', Absage: 'danger',
};

export default function ApplicationsScreen() {
  const { applications, setApplicationStatus } = useApp();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sent = applications.filter((item) => ['Gesendet', 'Vorstellungsgespräch', 'Zusage', 'Absage'].includes(item.status)).length;
  const interviews = applications.filter((item) => item.status === 'Vorstellungsgespräch').length;

  return <Screen wide>
    <PageHeader eyebrow="Bewerbungen" title="Dein Bewerbungsweg" subtitle="Jeder Vorgang mit aktuellem Stand und dem passenden nächsten Schritt." />
    <View style={styles.summary}>
      <Metric icon="folder-open-outline" value={`${applications.length}`} label="Bewerbungen" />
      <Metric icon="paper-plane-outline" value={`${sent}`} label="Versendet" />
      <Metric icon="calendar-outline" value={`${interviews}`} label="Gespräche" />
    </View>
    {!applications.length && <EmptyState icon="briefcase-outline" title="Noch keine Bewerbung" body="Öffne eine Ausbildungsstelle und starte dort deine Bewerbung." action={<Button compact label="Stellen entdecken" onPress={() => router.push('/jobs')} />} />}
    <View style={styles.list}>{applications.map((application) => {
      const job = getJob(application.jobId);
      return <Card key={application.jobId} style={styles.card}>
        <Pressable onPress={() => router.push(`/job/${job.id}`)} style={({ pressed }) => [styles.cardTop, pressed && { opacity: 0.7 }]}>
          <View style={styles.logo}><Text style={styles.logoText}>{job.logo}</Text></View>
          <View style={styles.titleWrap}><Text style={styles.jobTitle}>{job.title}</Text><Text style={styles.company}>{job.company} · {job.location}</Text></View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </Pressable>
        <View style={styles.statusHeader}><Text style={styles.statusLabel}>Aktueller Status</Text><Badge tone={tones[application.status]}>{application.status}</Badge></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statuses}>
          {statuses.map((status, index) => {
            const active = application.status === status;
            return <Pressable accessibilityRole="button" key={status} onPress={() => setApplicationStatus(job.id, status)} style={[styles.status, active && styles.activeStatus]}>
              <View style={[styles.statusDot, active && styles.activeDot]}><Text style={[styles.statusNumber, active && styles.activeStatusText]}>{index + 1}</Text></View>
              <Text style={[styles.statusText, active && styles.activeStatusText]}>{status}</Text>
            </Pressable>;
          })}
        </ScrollView>
        <View style={styles.footer}><Text style={styles.updated}>Aktualisiert: {application.updatedAt}</Text><Button compact variant="ghost" label="Unterlagen öffnen" icon="document-text-outline" onPress={() => router.push('/documents')} /></View>
      </Card>;
    })}</View>
  </Screen>;
}

function Metric({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <Card style={styles.metric}><View style={styles.metricIcon}><Ionicons name={icon} size={18} color={theme.colors.primary} /></View><View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View></Card>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  summary: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' }, metric: { flex: 1, minWidth: 140, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, metricIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, metricValue: { color: theme.colors.text, fontSize: 21, fontWeight: '800' }, metricLabel: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 1 },
  list: { gap: 16 }, card: { padding: 20 }, cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' }, logo: { width: 48, height: 48, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, logoText: { color: theme.colors.primaryStrong, fontWeight: '800' }, titleWrap: { flex: 1 }, jobTitle: { color: theme.colors.text, fontSize: 16, lineHeight: 21, fontWeight: '800' }, company: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 18, paddingTop: 16 }, statusLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700' }, statuses: { gap: 7, paddingVertical: 14 }, status: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted, paddingHorizontal: 10, borderRadius: theme.radius.pill }, activeStatus: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, statusDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, activeDot: { backgroundColor: 'rgba(255,255,255,0.16)' }, statusNumber: { color: theme.colors.textSecondary, fontSize: 9, fontWeight: '800' }, statusText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700' }, activeStatusText: { color: theme.colors.white },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, updated: { color: theme.colors.textTertiary, fontSize: 11 },
});
