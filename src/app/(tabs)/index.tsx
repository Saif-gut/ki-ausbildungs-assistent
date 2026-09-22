import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, FadeIn, PageHeader, ProgressBar, SectionTitle } from '@/components/ui';
import { JobCard } from '@/components/JobCard';
import { getJob, jobs } from '@/data/jobs';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';
import { useMemo } from 'react';

export default function HomeScreen() {
  const { profile, profileProgress, applications } = useApp();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const activeApplication = applications[0];
  const activeJob = activeApplication ? getJob(activeApplication.jobId) : null;
  return <Screen wide>
    <PageHeader eyebrow="AusbildungsKompass" title={`Hallo ${profile.firstName}`} subtitle="Dein nächster Schritt in die Ausbildung – klar, persönlich und gut vorbereitet." action={<View style={styles.avatar}><Text style={styles.avatarText}>{profile.firstName[0]}{profile.lastName[0]}</Text></View>} />
    <View style={[styles.dashboard, width >= 900 && styles.dashboardDesktop]}>
      <View style={styles.mainColumn}>
        <FadeIn><Card style={styles.progressCard}><View style={styles.cardHeader}><View style={styles.leadingIcon}><Ionicons name="person-outline" size={21} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Dein Profil</Text><Text style={styles.cardHint}>Vollständige Angaben verbessern Lebenslauf und Stellenvergleich.</Text></View></View><ProgressBar value={profileProgress} label="Profilfortschritt" /><Button compact variant="ghost" label="Profil vervollständigen" icon="arrow-forward" onPress={() => router.push('/profile/edit')} /></Card></FadeIn>
        <SectionTitle title="Empfohlen für dich" subtitle="Passend zu deinen Interessen und deinem Abschluss" action="Alle Stellen" onAction={() => router.push('/jobs')} />
        <FadeIn delay={80}><JobCard job={jobs[0]} compact /></FadeIn>
      </View>
      <View style={styles.sideColumn}>
        <FadeIn delay={50}><Pressable onPress={() => router.push('/coach')}><Card style={styles.coachCard}><View style={styles.coachMark}><Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.white} /></View><Badge tone="primary">PERSÖNLICHER COACH</Badge><Text style={styles.coachTitle}>Was möchtest du über deine Ausbildung wissen?</Text><Text style={styles.coachBody}>Fragen stellen, Stellen verstehen oder ein Gespräch üben.</Text><View style={styles.coachLink}><Text style={styles.coachLinkText}>Coach öffnen</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.primary} /></View></Card></Pressable></FadeIn>
        <SectionTitle title="Als Nächstes" /><Card style={styles.taskCard}><Task icon="document-text-outline" title="Lebenslauf prüfen" meta="Etwa 5 Minuten" onPress={() => router.push('/documents')} /><Task icon="school-outline" title="Interview vorbereiten" meta={jobs[0].title} onPress={() => router.push(`/interview/${jobs[0].id}`)} last /></Card>
        <SectionTitle title="Aktuelle Bewerbung" action="Alle" onAction={() => router.push('/applications')} />
        {activeJob && activeApplication ? <Card style={styles.applicationCard}><View style={styles.applicationTop}><View style={styles.miniLogo}><Text style={styles.miniLogoText}>{activeJob.logo}</Text></View><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.applicationTitle}>{activeJob.title}</Text><Text style={styles.applicationCompany}>{activeJob.company}</Text></View></View><View style={styles.applicationFooter}><Badge tone="success">{activeApplication.status}</Badge><Text style={styles.updated}>{activeApplication.updatedAt}</Text></View></Card> : null}
      </View>
    </View>
  </Screen>;
}

function Task({ icon, title, meta, onPress, last }: { icon: keyof typeof Ionicons.glyphMap; title: string; meta: string; onPress: () => void; last?: boolean }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.task, !last && styles.taskBorder, pressed && { opacity: 0.65 }]}><View style={styles.taskIcon}><Ionicons name={icon} size={19} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.taskTitle}>{title}</Text><Text numberOfLines={1} style={styles.taskMeta}>{meta}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} /></Pressable>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.text, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: theme.colors.background, fontWeight: '800' },
  dashboard: { gap: 4 }, dashboardDesktop: { flexDirection: 'row', gap: 28, alignItems: 'flex-start' }, mainColumn: { flex: 1.45, minWidth: 0 }, sideColumn: { flex: 1, minWidth: 0 },
  progressCard: { gap: 18 }, cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' }, leadingIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '800' }, cardHint: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  coachCard: { backgroundColor: theme.colors.primarySubtle, borderColor: theme.colors.primarySoft }, coachMark: { width: 48, height: 48, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, coachTitle: { color: theme.colors.text, fontSize: 20, lineHeight: 26, fontWeight: '800', marginTop: 14, letterSpacing: -0.2 }, coachBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 8 }, coachLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 }, coachLinkText: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
  taskCard: { paddingVertical: 4, paddingHorizontal: 18 }, task: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11 }, taskBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border }, taskIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, taskTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '700' }, taskMeta: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 3 },
  applicationCard: { padding: 17 }, applicationTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, miniLogo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }, miniLogoText: { color: theme.colors.primaryStrong, fontWeight: '800' }, applicationTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '700' }, applicationCompany: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 3 }, applicationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }, updated: { color: theme.colors.textTertiary, fontSize: 11 },
});
