import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, PageHeader, ProgressBar } from '@/components/ui';
import { getJob } from '@/data/jobs';
import { askAI } from '@/lib/aiClient';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';

const questions = ['Erzähl uns kurz etwas über dich.', 'Warum möchtest du genau diese Ausbildung machen?', 'Welche Stärke hilft dir in dieser Ausbildung besonders?', 'Beschreibe eine Situation, in der du ein Problem gelöst hast.'];

export default function InterviewScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const job = getJob(jobId);
  const { profile } = useApp();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [step, setStep] = useState(0); const [answer, setAnswer] = useState(''); const [feedback, setFeedback] = useState(''); const [loading, setLoading] = useState(false);
  const done = step >= questions.length;

  async function evaluate() {
    setLoading(true);
    const orchestrated = await askAI({ message: `Trainiere mit mir ein Vorstellungsgespräch. Frage: ${questions[step]} Meine Antwort: ${answer}`, profile, job });
    const words = answer.trim().split(/\s+/).filter(Boolean).length;
    setFeedback(orchestrated ?? (words < 15 ? 'Deine Antwort ist noch sehr kurz. Ergänze ein konkretes Beispiel: Situation, dein Beitrag und das Ergebnis.' : 'Gute Grundlage. Benenne deinen eigenen Beitrag und ein konkretes Ergebnis noch klarer.'));
    setLoading(false);
  }

  if (done) return <Screen><Card style={styles.done}><View style={styles.doneIcon}><Ionicons name="checkmark" size={34} color={theme.colors.white} /></View><Badge tone="success">TRAINING BEENDET</Badge><Text style={styles.doneTitle}>Gut vorbereitet</Text><Text style={styles.doneText}>Du hast vier typische Fragen bearbeitet. Wiederhole das Training später mit neuen Beispielen, damit deine Antworten natürlich bleiben.</Text><Button label="Noch einmal üben" icon="refresh-outline" onPress={() => { setStep(0); setAnswer(''); setFeedback(''); }} /></Card></Screen>;

  return <Screen>
    <PageHeader eyebrow="Interviewtraining" title="Sicher ins Gespräch" subtitle={`${job.title} · ${job.company}`} />
    <Card style={styles.progressCard}><View style={styles.progressTop}><Text style={styles.progressTitle}>Dein Training</Text><Badge tone="primary">Frage {step + 1} von {questions.length}</Badge></View><ProgressBar value={Math.round(((step + 1) / questions.length) * 100)} /></Card>
    <Card style={styles.questionCard}><View style={styles.coachRow}><View style={styles.coachMark}><Ionicons name="compass-outline" size={19} color={theme.colors.white} /></View><View><Text style={styles.coachName}>Ausbildungs-Assistent</Text><Text style={styles.coachCaption}>Interviewer</Text></View></View><Text style={styles.question}>{questions[step]}</Text><Text style={styles.questionHint}>Nimm dir kurz Zeit und antworte so, wie du es im echten Gespräch sagen würdest.</Text></Card>
    <Text style={styles.label}>Deine Antwort</Text><TextInput accessibilityLabel="Antwort im Interviewtraining" value={answer} onChangeText={(value) => { setAnswer(value); setFeedback(''); }} multiline placeholder="Formuliere deine Antwort in deinen eigenen Worten …" placeholderTextColor={theme.colors.textTertiary} style={styles.input} />
    {feedback ? <Card style={styles.feedback}><View style={styles.feedbackIcon}><Ionicons name="bulb-outline" size={21} color={theme.colors.warning} /></View><View style={{ flex: 1 }}><Text style={styles.feedbackTitle}>Dein Feedback</Text><Text style={styles.feedbackText}>{feedback}</Text><Text style={styles.feedbackTip}>Tipp: Persönliche Beispiele wirken stärker als allgemeine Aussagen.</Text></View></Card> : null}
    {!feedback ? <Button label={loading ? 'Antwort wird geprüft …' : 'Antwort auswerten'} icon="sparkles-outline" disabled={!answer.trim() || loading} onPress={evaluate} /> : <Button label={step === questions.length - 1 ? 'Training abschließen' : 'Nächste Frage'} icon="arrow-forward" onPress={() => { setStep(step + 1); setAnswer(''); setFeedback(''); }} />}
    <View style={styles.note}><Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} /><Text style={styles.noteText}>Feedback ist eine Übungshilfe. Entscheidend sind deine eigenen Erfahrungen und eine ehrliche Antwort.</Text></View>
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  progressCard: { padding: 17, marginBottom: 16, gap: 12 }, progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, progressTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '800' }, questionCard: { padding: 24, marginBottom: 18 }, coachRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }, coachMark: { width: 40, height: 40, borderRadius: 13, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }, coachName: { color: theme.colors.text, fontSize: 13, fontWeight: '800' }, coachCaption: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 2 }, question: { color: theme.colors.text, fontSize: 22, lineHeight: 30, fontWeight: '800', letterSpacing: -0.2 }, questionHint: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 10 }, label: { color: theme.colors.text, fontWeight: '700', fontSize: 13, marginBottom: 8 }, input: { minHeight: 160, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radius.lg, padding: 16, color: theme.colors.text, fontSize: 14, lineHeight: 21, textAlignVertical: 'top', marginBottom: 14 }, feedback: { flexDirection: 'row', gap: 12, backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warningSoft, marginBottom: 14, shadowOpacity: 0, elevation: 0 }, feedbackIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, feedbackTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 13 }, feedbackText: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 19, marginTop: 5 }, feedbackTip: { color: theme.colors.warning, fontSize: 11, lineHeight: 17, marginTop: 10, fontWeight: '600' }, note: { flexDirection: 'row', gap: 7, alignItems: 'flex-start', justifyContent: 'center', marginTop: 14 }, noteText: { color: theme.colors.textSecondary, fontSize: 10, lineHeight: 15, flex: 1 },
  done: { alignItems: 'center', paddingVertical: 42, marginTop: 40 }, doneIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: theme.colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, doneTitle: { color: theme.colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 16 }, doneText: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 23, maxWidth: 440 },
});
