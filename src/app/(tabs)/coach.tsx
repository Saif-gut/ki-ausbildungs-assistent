import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge, Card, PageHeader, SectionTitle } from '@/components/ui';
import { jobs } from '@/data/jobs';
import { askAI } from '@/lib/aiClient';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';

const starters = [
  { icon: 'compass-outline' as const, title: 'Beruf verstehen', prompt: 'Welche Ausbildung könnte zu meinen Interessen passen?' },
  { icon: 'document-text-outline' as const, title: 'Bewerbung verbessern', prompt: 'Wie kann ich meine Bewerbung überzeugender machen?' },
  { icon: 'mic-outline' as const, title: 'Gespräch vorbereiten', prompt: 'Wie bereite ich mich auf ein Vorstellungsgespräch vor?' },
];

export default function CoachScreen() {
  const { profile } = useApp();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function send(prompt: string) {
    if (!prompt.trim() || loading) return;
    setText(''); setAnswer(''); setLoading(true);
    const response = await askAI({ message: prompt, profile });
    setAnswer(response ?? 'Der Coach-Server ist noch nicht verbunden. Du kannst trotzdem eine Stelle öffnen und dort die lokale Demo-Beratung nutzen.');
    setLoading(false);
  }

  return <Screen>
    <PageHeader eyebrow="Dein Begleiter" title="Ausbildungs-Coach" subtitle="Frage nach Berufen, Bewerbungen oder Vorstellungsgesprächen. Deine Angaben werden nur verwendet, wenn sie für die Antwort nötig sind." action={<View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>Bereit</Text></View>} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Card style={styles.welcome}><View style={styles.mark}><Ionicons name="sparkles-outline" size={24} color={theme.colors.primary} /></View><Text style={styles.welcomeTitle}>Wobei kann ich dich unterstützen?</Text><Text style={styles.welcomeText}>Du bekommst eine klare Antwort unseres Ausbildungs-Assistenten – ohne technische Zwischenschritte.</Text>
        <View style={styles.starters}>{starters.map((item) => <Pressable key={item.title} onPress={() => send(item.prompt)} style={({ pressed }) => [styles.starter, pressed && { opacity: 0.7 }]}><View style={styles.starterIcon}><Ionicons name={item.icon} size={18} color={theme.colors.primary} /></View><Text style={styles.starterText}>{item.title}</Text><Ionicons name="arrow-forward" size={15} color={theme.colors.textTertiary} /></Pressable>)}</View>
      </Card>
      {Boolean(loading || answer) && <View style={styles.answerWrap}><View style={styles.coachAvatar}><Ionicons name="compass-outline" size={19} color={theme.colors.white} /></View><Card style={styles.answerCard}><Text style={styles.answerText}>{loading ? 'Ich bereite eine passende Antwort für dich vor …' : answer}</Text></Card></View>}
      <View style={styles.composer}><TextInput accessibilityLabel="Frage an den Ausbildungs-Coach" value={text} onChangeText={setText} placeholder="Stelle deine Frage …" placeholderTextColor={theme.colors.textTertiary} style={styles.input} multiline /><Pressable accessibilityLabel="Frage senden" disabled={!text.trim() || loading} onPress={() => send(text)} style={[styles.send, (!text.trim() || loading) && { opacity: 0.4 }]}><Ionicons name="arrow-up" size={20} color={theme.colors.white} /></Pressable></View>
    </KeyboardAvoidingView>
    <SectionTitle title="Mit Stellenkontext" subtitle="Der Coach berücksichtigt dann Aufgaben und Anforderungen der Anzeige." />
    {jobs.slice(0, 2).map((job) => <Pressable key={job.id} onPress={() => router.push(`/chat/${job.id}`)}><Card style={styles.contextCard}><View style={styles.contextLogo}><Text style={styles.contextLogoText}>{job.logo}</Text></View><View style={{ flex: 1 }}><Text style={styles.contextTitle}>{job.title}</Text><Text style={styles.contextCompany}>{job.company}</Text></View><Badge tone="primary">Stelle öffnen</Badge></Card></Pressable>)}
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.colors.successSoft, paddingVertical: 8, paddingHorizontal: 11, borderRadius: theme.radius.pill }, statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.success }, statusText: { color: theme.colors.success, fontSize: 11, fontWeight: '700' },
  welcome: { alignItems: 'center', paddingVertical: 30 }, mark: { width: 52, height: 52, borderRadius: 17, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, welcomeTitle: { color: theme.colors.text, fontSize: 21, fontWeight: '800', marginTop: 16 }, welcomeText: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 480, marginTop: 7 }, starters: { width: '100%', gap: 8, marginTop: 24 }, starter: { minHeight: 50, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, starterIcon: { width: 31, height: 31, borderRadius: 10, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, starterText: { flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  answerWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 16 }, coachAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }, answerCard: { flex: 1, padding: 16, borderTopLeftRadius: 6 }, answerText: { color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  composer: { minHeight: 58, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.borderStrong, flexDirection: 'row', alignItems: 'flex-end', padding: 7, marginTop: 16, ...theme.shadow }, input: { flex: 1, maxHeight: 110, minHeight: 42, color: theme.colors.text, paddingHorizontal: 11, paddingVertical: 10, fontSize: 14 }, send: { width: 42, height: 42, borderRadius: 13, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  contextCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, marginBottom: 9 }, contextLogo: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, contextLogoText: { color: theme.colors.primaryStrong, fontWeight: '800' }, contextTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '700' }, contextCompany: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 3 },
});
