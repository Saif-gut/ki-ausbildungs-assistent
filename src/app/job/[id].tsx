import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, SectionTitle } from '@/components/ui';
import { getJob } from '@/data/jobs';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';
import { RequirementState } from '@/types';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = getJob(id);
  const { savedJobIds, toggleSaved, setApplicationStatus } = useApp();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showMatch, setShowMatch] = useState(false);
  const saved = savedJobIds.includes(job.id);
  const counts = { met: job.requirements.filter((item) => item.state === 'met').length, open: job.requirements.filter((item) => item.state === 'open').length, missing: job.requirements.filter((item) => item.state === 'missing').length };

  return <Screen wide>
    <Card style={styles.hero}>
      <View style={styles.heroTop}><View style={styles.logo}><Text style={styles.logoText}>{job.logo}</Text></View><Pressable accessibilityLabel="Stelle speichern" onPress={() => toggleSaved(job.id)} style={({ pressed }) => [styles.save, saved && styles.saveActive, pressed && { opacity: 0.7 }]}><Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={21} color={theme.colors.primary} /><Text style={styles.saveText}>{saved ? 'Gespeichert' : 'Speichern'}</Text></Pressable></View>
      <Text style={styles.title}>{job.title}</Text><Text style={styles.company}>{job.company}</Text>
      <View style={styles.meta}><Meta icon="location-outline" text={`${job.location} · ${job.distance}`} /><Meta icon="calendar-clear-outline" text={`Beginn ${job.start}`} /></View>
      <View style={styles.tags}>{job.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</View>
    </Card>

    <View style={[styles.actionGrid, width >= 800 && styles.actionGridDesktop]}>
      <Button label="Mit Coach über diese Stelle sprechen" icon="chatbubble-ellipses-outline" onPress={() => router.push(`/chat/${job.id}`)} />
      <Button variant="secondary" label="Profil mit Anforderungen vergleichen" icon="git-compare-outline" onPress={() => setShowMatch(true)} />
      <Button variant="secondary" label="Bewerbung erstellen" icon="document-text-outline" onPress={() => { setApplicationStatus(job.id, 'Entwurf'); router.push('/documents'); }} />
      <Button variant="ghost" label={saved ? 'Stelle gespeichert' : 'Stelle speichern'} icon={saved ? 'bookmark' : 'bookmark-outline'} onPress={() => toggleSaved(job.id)} />
    </View>

    <View style={[styles.content, width >= 900 && styles.contentDesktop]}>
      <View style={styles.main}>
        <SectionTitle title="Über die Ausbildung" /><Text style={styles.body}>{job.summary}</Text>
        <SectionTitle title="Deine Aufgaben" /><Card subtle>{job.tasks.map((task) => <View key={task} style={styles.task}><View style={styles.check}><Ionicons name="checkmark" size={14} color={theme.colors.primary} /></View><Text style={styles.taskText}>{task}</Text></View>)}</Card>
        <SectionTitle title="Profil & Anforderungen" subtitle="Transparenter Vergleich auf Basis deiner Angaben" />
        {!showMatch ? <Card style={styles.matchPrompt}><View style={styles.matchIcon}><Ionicons name="git-compare-outline" size={24} color={theme.colors.primary} /></View><Text style={styles.matchTitle}>Passt dein Profil zu dieser Stelle?</Text><Text style={styles.matchText}>Prüfe nachvollziehbar, welche Voraussetzungen belegt, offen oder noch nicht erfüllt sind.</Text><Button compact label="Vergleich anzeigen" onPress={() => setShowMatch(true)} /></Card> : <Card>
          <View style={styles.counts}><Count value={counts.met} label="Belegt" color={theme.colors.success} /><Count value={counts.open} label="Offen" color={theme.colors.warning} /><Count value={counts.missing} label="Fehlt" color={theme.colors.danger} /></View>
          <View style={styles.explain}><Ionicons name="information-circle-outline" size={18} color={theme.colors.info} /><Text style={styles.explainText}>Die Checkliste nutzt nur konkrete Angaben und zeigt keine erfundene Chancen-Prozentzahl.</Text></View>
          {job.requirements.map((requirement, index) => <Requirement key={requirement.label} {...requirement} last={index === job.requirements.length - 1} />)}
        </Card>}
      </View>
      <View style={styles.side}>
        <SectionTitle title="Vergütung" /><InfoCard icon="wallet-outline" text={job.salary} />
        <SectionTitle title="Perspektiven" /><InfoCard icon="trending-up-outline" text={job.future} />
        <SectionTitle title="Nächster Schritt" /><Card style={styles.next}><Text style={styles.nextTitle}>Bereit für deine Bewerbung?</Text><Text style={styles.nextText}>Erstelle einen ersten Entwurf und passe ihn anschließend in Ruhe an.</Text><Button label="Bewerbung erstellen" icon="arrow-forward" onPress={() => { setApplicationStatus(job.id, 'Entwurf'); router.push('/documents'); }} /><Button variant="ghost" label="Interview üben" icon="mic-outline" onPress={() => router.push(`/interview/${job.id}`)} /></Card>
      </View>
    </View>
    <Text style={styles.source}>Beispielanzeige · Angaben vor einer echten Bewerbung an der Originalquelle prüfen.</Text>
  </Screen>;
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]); return <View style={styles.metaItem}><Ionicons name={icon} size={16} color={theme.colors.textSecondary} /><Text style={styles.metaText}>{text}</Text></View>; }
function Count({ value, label, color }: { value: number; label: string; color: string }) { const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]); return <View style={styles.count}><Text style={[styles.countValue, { color }]}>{value}</Text><Text style={styles.countLabel}>{label}</Text></View>; }
function Requirement({ label, state, evidence, last }: { label: string; state: RequirementState; evidence?: string; last?: boolean }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  const config = state === 'met' ? { icon: 'checkmark-circle' as const, color: theme.colors.success, label: 'Belegt' } : state === 'open' ? { icon: 'help-circle' as const, color: theme.colors.warning, label: 'Offen' } : { icon: 'close-circle' as const, color: theme.colors.danger, label: 'Fehlt' };
  return <View style={[styles.requirement, last && styles.requirementLast]}><Ionicons name={config.icon} size={22} color={config.color} /><View style={{ flex: 1 }}><View style={styles.reqTop}><Text style={styles.reqTitle}>{label}</Text><Text style={[styles.reqState, { color: config.color }]}>{config.label}</Text></View><Text style={styles.evidence}>{evidence || 'Noch keine passende Angabe im Profil'}</Text></View></View>;
}
function InfoCard({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]); return <Card style={styles.infoCard}><View style={styles.infoIcon}><Ionicons name={icon} size={21} color={theme.colors.primary} /></View><Text style={styles.infoText}>{text}</Text></Card>; }

const createStyles = (theme: AppTheme) => StyleSheet.create({
  hero: { padding: 26, marginBottom: 16 }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, logo: { width: 58, height: 58, borderRadius: 17, backgroundColor: theme.colors.primarySoft, justifyContent: 'center', alignItems: 'center' }, logoText: { fontWeight: '800', fontSize: 17, color: theme.colors.primaryStrong }, save: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }, saveActive: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary }, saveText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' }, title: { color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 }, company: { color: theme.colors.primaryStrong, fontSize: 15, fontWeight: '700', marginTop: 6 }, meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 17 }, metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: theme.colors.textSecondary, fontSize: 12 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 17 },
  actionGrid: { gap: 9 }, actionGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' }, content: {}, contentDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 28 }, main: { flex: 1.55, minWidth: 0 }, side: { flex: 1, minWidth: 0 }, body: { color: theme.colors.text, lineHeight: 23, fontSize: 14 }, task: { flexDirection: 'row', gap: 10, marginVertical: 7, alignItems: 'flex-start' }, check: { width: 24, height: 24, borderRadius: 8, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, taskText: { color: theme.colors.text, fontSize: 13, lineHeight: 20, flex: 1 },
  matchPrompt: { alignItems: 'center', paddingVertical: 28 }, matchIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, matchTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '800', marginTop: 14 }, matchText: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 410, marginTop: 6, marginBottom: 16 }, counts: { flexDirection: 'row', marginBottom: 16 }, count: { flex: 1, alignItems: 'center' }, countValue: { fontSize: 24, fontWeight: '800' }, countLabel: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }, explain: { flexDirection: 'row', gap: 8, backgroundColor: theme.colors.infoSoft, padding: 12, borderRadius: theme.radius.sm, marginBottom: 8 }, explainText: { flex: 1, color: theme.colors.info, fontSize: 11, lineHeight: 17 }, requirement: { flexDirection: 'row', gap: 10, paddingVertical: 13, borderBottomColor: theme.colors.border, borderBottomWidth: 1 }, requirementLast: { borderBottomWidth: 0, paddingBottom: 0 }, reqTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, reqTitle: { flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '700' }, reqState: { fontSize: 10, fontWeight: '800' }, evidence: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 4 },
  infoCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 18 }, infoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, infoText: { flex: 1, color: theme.colors.text, fontSize: 13, lineHeight: 20 }, next: { gap: 12, backgroundColor: theme.colors.primarySubtle, borderColor: theme.colors.primarySoft }, nextTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800' }, nextText: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 2 }, source: { color: theme.colors.textTertiary, fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 24 },
});
