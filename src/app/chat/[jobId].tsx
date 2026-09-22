import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getJob } from '@/data/jobs';
import { askAI } from '@/lib/aiClient';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';

type Message = { role: 'assistant' | 'user'; text: string };
const suggestions = ['Was mache ich dort täglich?', 'Wie ist die Vergütung?', 'Welche Perspektiven habe ich?', 'Wie bereite ich mich vor?'];

export default function ChatScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const job = getJob(jobId);
  const { profile } = useApp();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: `Hallo ${profile.firstName}, ich helfe dir dabei, diese Ausbildungsstelle besser zu verstehen. Was möchtest du wissen?` }]);

  async function answer(question: string) {
    if (!question.trim() || loading) return;
    const history = messages.map((message) => ({ role: message.role === 'assistant' ? 'assistant' as const : 'user' as const, content: message.text }));
    setMessages((current) => [...current, { role: 'user', text: question.trim() }]);
    setText(''); setLoading(true);
    const orchestrated = await askAI({ message: question.trim(), profile, job, conversation: history });
    const normalized = question.toLowerCase();
    const fallback = normalized.includes('verdien') || normalized.includes('vergütung') ? job.salary
      : normalized.includes('perspekt') || normalized.includes('später') || normalized.includes('zukunft') ? job.future
      : normalized.includes('täglich') || normalized.includes('aufgabe') || normalized.includes('machen') ? `Typische Aufgaben laut Anzeige sind: ${job.tasks.join(', ')}. Der genaue Alltag hängt vom Betrieb und vom Ausbildungsjahr ab.`
      : normalized.includes('vorbere') || normalized.includes('bewerb') ? `Verbinde deine Erfahrungen mit den Anforderungen der Stelle. Bereite außerdem ein konkretes Beispiel für dein Interesse an ${job.tags[0]} vor.`
      : `Dazu enthält die Anzeige keine verlässliche Angabe. Prüfe die Originalanzeige oder frage ${job.company} direkt.`;
    setMessages((current) => [...current, { role: 'assistant', text: orchestrated ?? fallback }]);
    setLoading(false);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  return <SafeAreaView edges={['bottom']} style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
    <View style={styles.contextBar}><View style={styles.contextInner}><View style={styles.logo}><Text style={styles.logoText}>{job.logo}</Text></View><View style={styles.contextText}><Text style={styles.contextLabel}>Du sprichst gerade über</Text><Text numberOfLines={1} style={styles.job}>{job.title} bei {job.company}</Text></View><View style={styles.private}><Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.success} /><Text style={styles.privateText}>Geschützt</Text></View></View></View>
    <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
      <View style={styles.assistantIntro}><View style={styles.assistantMark}><Ionicons name="compass-outline" size={21} color={theme.colors.white} /></View><View><Text style={styles.assistantName}>Ausbildungs-Assistent</Text><Text style={styles.assistantCaption}>Antwortet im Kontext dieser Stelle</Text></View></View>
      {messages.map((message, index) => <View key={`${message.role}-${index}`} style={[styles.messageRow, message.role === 'user' && styles.userRow]}>{message.role === 'assistant' && <View style={styles.smallMark}><Ionicons name="compass-outline" size={14} color={theme.colors.primary} /></View>}<View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}><Text style={[styles.message, message.role === 'user' && styles.userMessage]}>{message.text}</Text></View></View>)}
      {loading && <View style={styles.messageRow}><View style={styles.smallMark}><Ionicons name="compass-outline" size={14} color={theme.colors.primary} /></View><View style={[styles.bubble, styles.assistantBubble]}><Text style={styles.typing}>Antwort wird vorbereitet …</Text></View></View>}
      {messages.length <= 1 && <View style={styles.suggestions}>{suggestions.map((item) => <Pressable disabled={loading} key={item} onPress={() => answer(item)} style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.7 }]}><Text style={styles.suggestionText}>{item}</Text><Ionicons name="arrow-forward" size={14} color={theme.colors.primary} /></Pressable>)}</View>}
    </ScrollView>
    <View style={styles.composerWrap}><View style={styles.composer}><TextInput accessibilityLabel="Frage zu dieser Stelle" value={text} onChangeText={setText} placeholder="Frage zu Aufgaben, Gehalt oder Bewerbung …" placeholderTextColor={theme.colors.textTertiary} style={styles.input} multiline /><Pressable accessibilityLabel="Frage senden" disabled={!text.trim() || loading} onPress={() => answer(text)} style={({ pressed }) => [styles.send, (!text.trim() || loading) && styles.sendDisabled, pressed && { opacity: 0.75 }]}><Ionicons name="arrow-up" size={20} color={theme.colors.white} /></Pressable></View><Text style={styles.disclaimer}>Wichtige Angaben bitte an der Originalquelle prüfen.</Text></View>
  </KeyboardAvoidingView></SafeAreaView>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: theme.colors.background }, contextBar: { backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border }, contextInner: { width: '100%', maxWidth: 820, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 18, paddingVertical: 12 }, logo: { width: 42, height: 42, borderRadius: 13, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, logoText: { color: theme.colors.primaryStrong, fontWeight: '800', fontSize: 12 }, contextText: { flex: 1 }, contextLabel: { color: theme.colors.textTertiary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '700' }, job: { color: theme.colors.text, fontWeight: '700', fontSize: 13, marginTop: 3 }, private: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: theme.colors.successSoft, paddingHorizontal: 9, paddingVertical: 6, borderRadius: theme.radius.pill }, privateText: { color: theme.colors.success, fontSize: 9, fontWeight: '700' },
  messages: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 22, paddingBottom: 30 }, assistantIntro: { flexDirection: 'row', gap: 11, alignItems: 'center', marginBottom: 23 }, assistantMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }, assistantName: { color: theme.colors.text, fontSize: 14, fontWeight: '800' }, assistantCaption: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }, messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 11 }, userRow: { justifyContent: 'flex-end' }, smallMark: { width: 28, height: 28, borderRadius: 9, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginTop: 3 }, bubble: { maxWidth: '82%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 17 }, assistantBubble: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderTopLeftRadius: 6 }, userBubble: { backgroundColor: theme.colors.primary, borderTopRightRadius: 6 }, message: { color: theme.colors.text, fontSize: 14, lineHeight: 21 }, userMessage: { color: theme.colors.white }, typing: { color: theme.colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  suggestions: { marginLeft: 36, gap: 8, marginTop: 4 }, suggestion: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: 14, borderRadius: theme.radius.md }, suggestionText: { color: theme.colors.text, fontSize: 12, fontWeight: '600', flex: 1 }, composerWrap: { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 }, composer: { width: '100%', maxWidth: 820, alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-end', gap: 9 }, input: { flex: 1, maxHeight: 112, minHeight: 50, paddingHorizontal: 15, paddingVertical: 13, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, color: theme.colors.text, fontSize: 14, borderWidth: 1, borderColor: theme.colors.border }, send: { width: 50, height: 50, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.35 }, disclaimer: { color: theme.colors.textTertiary, fontSize: 9, textAlign: 'center', marginTop: 6 },
});
