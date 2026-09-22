import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button, Card, PageHeader, SectionTitle } from '@/components/ui';
import { jobs } from '@/data/jobs';
import { askAI, isAIServerConfigured } from '@/lib/aiClient';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';
import { coverLetter, cvHtml } from '@/utils/documents';

type ResumeStyle = 'classic' | 'modern' | 'minimal';
const resumeStyles: { id: ResumeStyle; label: string; description: string }[] = [
  { id: 'classic', label: 'Klassisch', description: 'Traditionell und klar' }, { id: 'modern', label: 'Modern', description: 'Akzentuiert und frisch' }, { id: 'minimal', label: 'Minimal', description: 'Reduziert und ruhig' },
];

export default function DocumentsScreen() {
  const { profile } = useApp();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tab, setTab] = useState<'cv' | 'letter'>('cv');
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>('modern');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [generating, setGenerating] = useState(false);
  const job = jobs[0];

  async function exportPdf() {
    if (Platform.OS === 'web') return Alert.alert('PDF-Export', 'Öffne die App auf Android oder iOS, um den Lebenslauf als PDF zu teilen.');
    const result = await Print.printToFileAsync({ html: cvHtml(profile) });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', dialogTitle: 'Lebenslauf teilen' });
  }
  async function generateLetter() {
    setGenerating(true);
    const answer = await askAI({ message: 'Erstelle mir ein individuelles Anschreiben für diese Ausbildungsstelle.', profile, job });
    setGenerating(false);
    if (answer) setGeneratedLetter(answer);
    else Alert.alert('Entwurf verfügbar', isAIServerConfigured ? 'Der Assistent ist gerade nicht erreichbar. Der lokale Entwurf bleibt verfügbar.' : 'Der lokale Entwurf bleibt verfügbar, bis der Assistent verbunden ist.');
  }

  return <Screen wide>
    <PageHeader eyebrow="Bewerbungsunterlagen" title="Lebenslauf & Anschreiben" subtitle="Professionelle Entwürfe aus deinem Profil – vollständig prüfbar und jederzeit anpassbar." />
    <View style={styles.tabs}><Pressable onPress={() => setTab('cv')} style={[styles.tab, tab === 'cv' && styles.activeTab]}><Ionicons name="person-outline" size={17} color={tab === 'cv' ? theme.colors.primary : theme.colors.textSecondary} /><Text style={[styles.tabText, tab === 'cv' && styles.activeTabText]}>Lebenslauf</Text></Pressable><Pressable onPress={() => setTab('letter')} style={[styles.tab, tab === 'letter' && styles.activeTab]}><Ionicons name="mail-outline" size={17} color={tab === 'letter' ? theme.colors.primary : theme.colors.textSecondary} /><Text style={[styles.tabText, tab === 'letter' && styles.activeTabText]}>Anschreiben</Text></Pressable></View>

    {tab === 'cv' ? <>
      <SectionTitle title="Design auswählen" subtitle="Drei professionelle Stilrichtungen – Inhalte bleiben gleich." />
      <View style={styles.styleGrid}>{resumeStyles.map((item) => <Pressable key={item.id} onPress={() => setResumeStyle(item.id)} style={[styles.styleChoice, resumeStyle === item.id && styles.styleChoiceActive]}><MiniResume variant={item.id} /><View style={{ flex: 1 }}><Text style={[styles.styleLabel, resumeStyle === item.id && styles.styleLabelActive]}>{item.label}</Text><Text style={styles.styleDescription}>{item.description}</Text></View>{resumeStyle === item.id && <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />}</Pressable>)}</View>
      <View style={[styles.workspace, width >= 930 && styles.workspaceDesktop]}><View style={styles.previewColumn}><View style={styles.previewLabel}><Text style={styles.previewTitle}>Vorschau</Text><View style={styles.draftBadge}><Text style={styles.draftText}>ENTWURF</Text></View></View><ResumePreview variant={resumeStyle} profile={profile} /></View><View style={styles.toolColumn}><Card style={styles.info}><View style={styles.infoIcon}><Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.info} /></View><View style={{ flex: 1 }}><Text style={styles.infoTitle}>Nur deine Angaben</Text><Text style={styles.infoText}>Geburtsdatum und Foto sind freiwillig. Prüfe alle Inhalte vor dem Versenden.</Text></View></Card><Card style={styles.quality}><Text style={styles.qualityTitle}>Vollständigkeit</Text><Check text="Kontaktdaten vorhanden" /><Check text="Schulbildung eingetragen" /><Check text="Erfahrung und Fähigkeiten ergänzt" /><Check text="Zeitangaben final prüfen" /></Card><Button label="Als PDF erstellen" icon="download-outline" onPress={exportPdf} /></View></View>
    </> : <>
      <Card style={styles.jobContext}><View style={styles.jobIcon}><Text style={styles.jobIconText}>{job.logo}</Text></View><View style={{ flex: 1 }}><Text style={styles.contextLabel}>Angepasst an</Text><Text style={styles.jobName}>{job.title}</Text><Text style={styles.jobCompany}>{job.company} · {job.location}</Text></View><Ionicons name="checkmark-circle" size={22} color={theme.colors.success} /></Card>
      <View style={[styles.workspace, width >= 930 && styles.workspaceDesktop]}><View style={styles.previewColumn}><View style={styles.previewLabel}><Text style={styles.previewTitle}>Anschreiben</Text><View style={styles.draftBadge}><Text style={styles.draftText}>ENTWURF</Text></View></View><View style={styles.letterPaper}><Text style={styles.letter}>{generatedLetter || coverLetter(profile, job)}</Text></View></View><View style={styles.toolColumn}><Card style={styles.quality}><Text style={styles.qualityTitle}>Vor dem Versenden</Text><Check text="Ansprechpartner und Adresse ergänzen" /><Check text="Eigene Motivation konkretisieren" /><Check text="Alle Angaben auf Richtigkeit prüfen" /><Check text="Rechtschreibung kontrollieren" /></Card><Button label={generating ? 'Entwurf wird erstellt …' : 'Entwurf neu erstellen'} disabled={generating} icon="sparkles-outline" onPress={generateLetter} /></View></View>
    </>}
  </Screen>;
}

function MiniResume({ variant }: { variant: ResumeStyle }) { const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]); return <View style={[styles.miniResume, variant === 'modern' && styles.miniModern, variant === 'minimal' && styles.miniMinimal]}><View style={styles.miniName} /><View style={styles.miniLine} /><View style={styles.miniLineShort} /></View>; }
function ResumePreview({ variant, profile }: { variant: ResumeStyle; profile: ReturnType<typeof useApp>['profile'] }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={[styles.paper, variant === 'classic' && styles.paperClassic, variant === 'minimal' && styles.paperMinimal]}>{variant === 'modern' && <View style={styles.modernStripe} />}<View style={[styles.paperContent, variant === 'modern' && styles.modernContent]}><Text style={[styles.name, variant === 'classic' && styles.classicName, variant === 'minimal' && styles.minimalName]}>{profile.firstName} {profile.lastName}</Text><Text style={styles.contact}>{profile.city} · {profile.email} · {profile.phone}</Text><CvSection variant={variant} title="Schulbildung" text={`${profile.schoolDegree}, voraussichtlich ${profile.graduationYear}\n${profile.school}`} /><CvSection variant={variant} title="Berufserfahrung" text={profile.experience} /><CvSection variant={variant} title="Praktika" text={profile.internships} /><CvSection variant={variant} title="Fähigkeiten" text={profile.skills} /><CvSection variant={variant} title="Sprachen" text={profile.languages} /></View></View>;
}
function CvSection({ title, text, variant }: { title: string; text: string; variant: ResumeStyle }) { const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]); return <View style={styles.cvSection}><Text style={[styles.cvTitle, variant === 'classic' && styles.classicTitle, variant === 'minimal' && styles.minimalTitle]}>{title}</Text><Text style={styles.cvText}>{text || 'Noch nicht angegeben'}</Text></View>; }
function Check({ text }: { text: string }) { const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]); return <View style={styles.check}><Ionicons name="checkmark-circle" size={18} color={theme.colors.success} /><Text style={styles.checkText}>{text}</Text></View>; }

const createStyles = (theme: AppTheme) => StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 5, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, marginBottom: 6, maxWidth: 520 }, tab: { flex: 1, minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm }, activeTab: { backgroundColor: theme.colors.surface, ...theme.shadow }, tabText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700' }, activeTabText: { color: theme.colors.primary },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 }, styleChoice: { flex: 1, minWidth: 210, minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 12 }, styleChoiceActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySubtle }, miniResume: { width: 40, height: 52, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE4E1', borderRadius: 3, padding: 5, gap: 4 }, miniModern: { borderLeftWidth: 5, borderLeftColor: '#087461' }, miniMinimal: { borderWidth: 0 }, miniName: { height: 4, width: '70%', backgroundColor: '#183029', borderRadius: 2 }, miniLine: { height: 2, width: '100%', backgroundColor: '#CAD5D1', marginTop: 5 }, miniLineShort: { height: 2, width: '65%', backgroundColor: '#CAD5D1' }, styleLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '800' }, styleLabelActive: { color: theme.colors.primaryStrong }, styleDescription: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 3 },
  workspace: { gap: 18 }, workspaceDesktop: { flexDirection: 'row', alignItems: 'flex-start' }, previewColumn: { flex: 1.6, minWidth: 0 }, toolColumn: { flex: 1, gap: 12 }, previewLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }, previewTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '700' }, draftBadge: { backgroundColor: theme.colors.warningSoft, paddingVertical: 5, paddingHorizontal: 9, borderRadius: theme.radius.pill }, draftText: { color: theme.colors.warning, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  paper: { minHeight: 620, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#D9E0DD', overflow: 'hidden', shadowColor: '#061813', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 }, paperClassic: { borderTopWidth: 5, borderTopColor: '#233E36' }, paperMinimal: { borderColor: '#ECEFED' }, modernStripe: { width: 10, backgroundColor: '#087461', position: 'absolute', top: 0, bottom: 0, left: 0 }, paperContent: { padding: 38 }, modernContent: { paddingLeft: 48 }, name: { fontSize: 26, fontWeight: '800', color: '#10221D', letterSpacing: -0.4 }, classicName: { fontFamily: Platform.OS === 'web' ? 'Georgia' : undefined }, minimalName: { fontSize: 23, fontWeight: '600' }, contact: { fontSize: 10, color: '#66756F', marginTop: 6 }, cvSection: { marginTop: 25 }, cvTitle: { color: '#087461', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, borderBottomWidth: 1.5, borderBottomColor: '#DCE6E1', paddingBottom: 6 }, classicTitle: { color: '#233E36', fontFamily: Platform.OS === 'web' ? 'Georgia' : undefined }, minimalTitle: { color: '#66756F', borderBottomWidth: 0, paddingBottom: 0, fontWeight: '600' }, cvText: { color: '#1C2E28', fontSize: 12, lineHeight: 18, marginTop: 8 },
  info: { flexDirection: 'row', gap: 11, padding: 17, backgroundColor: theme.colors.infoSoft, borderColor: theme.colors.infoSoft, shadowOpacity: 0, elevation: 0 }, infoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, infoTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '800' }, infoText: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 4 }, quality: { gap: 10 }, qualityTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800', marginBottom: 2 }, check: { flexDirection: 'row', gap: 8, alignItems: 'center' }, checkText: { color: theme.colors.textSecondary, fontSize: 12, flex: 1 },
  jobContext: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18, padding: 17 }, jobIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, jobIconText: { color: theme.colors.primaryStrong, fontWeight: '800' }, contextLabel: { color: theme.colors.textTertiary, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '700' }, jobName: { color: theme.colors.text, fontWeight: '800', marginTop: 2 }, jobCompany: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }, letterPaper: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 38, minHeight: 620, borderWidth: 1, borderColor: '#D9E0DD', shadowColor: '#061813', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 }, letter: { color: '#1C2E28', fontSize: 12, lineHeight: 20 },
});
