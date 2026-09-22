import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PropsWithChildren, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button, Card, Field, PageHeader } from '@/components/ui';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';

export default function EditProfileScreen() {
  const { profile, updateProfile } = useApp();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [draft, setDraft] = useState(profile);
  const set = (field: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const sideBySide = width >= 760;

  return <Screen wide>
    <PageHeader eyebrow="Profil bearbeiten" title="Deine Angaben" subtitle="Pflege die Bereiche einzeln. Geburtsdatum und spätere Fotodaten bleiben freiwillig." />
    <View style={[styles.grid, sideBySide && styles.desktopGrid]}>
      <Section icon="person-outline" title="Persönliche Angaben" subtitle="Kontakt und Wohnort">
        <View style={styles.row}><View style={styles.flex}><Field label="Vorname" value={draft.firstName} onChangeText={set('firstName')} /></View><View style={styles.flex}><Field label="Nachname" value={draft.lastName} onChangeText={set('lastName')} /></View></View>
        <Field label="Wohnort" value={draft.city} onChangeText={set('city')} /><Field label="E-Mail" value={draft.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" /><Field label="Telefon" value={draft.phone} onChangeText={set('phone')} keyboardType="phone-pad" /><Field label="Geburtsdatum" hint="Optional" value={draft.birthDate} onChangeText={set('birthDate')} placeholder="TT.MM.JJJJ" />
      </Section>
      <Section icon="school-outline" title="Schulbildung" subtitle="Abschluss und Schule">
        <Field label="Angestrebter Abschluss" value={draft.schoolDegree} onChangeText={set('schoolDegree')} /><Field label="Schule" value={draft.school} onChangeText={set('school')} /><Field label="Abschlussjahr" value={draft.graduationYear} onChangeText={set('graduationYear')} keyboardType="number-pad" />
      </Section>
      <Section icon="briefcase-outline" title="Erfahrung" subtitle="Berufserfahrung und Praktika">
        <Field label="Berufserfahrung" value={draft.experience} onChangeText={set('experience')} multiline /><Field label="Praktika" value={draft.internships} onChangeText={set('internships')} multiline />
      </Section>
      <Section icon="sparkles-outline" title="Kenntnisse" subtitle="Was dich auszeichnet">
        <Field label="Fähigkeiten und Stärken" value={draft.skills} onChangeText={set('skills')} multiline /><Field label="Sprachen" value={draft.languages} onChangeText={set('languages')} multiline /><Field label="Zertifikate" value={draft.certificates} onChangeText={set('certificates')} multiline /><Field label="Interessen" value={draft.interests} onChangeText={set('interests')} multiline />
      </Section>
    </View>
    <View style={styles.actions}><Button variant="secondary" label="Abbrechen" onPress={() => router.back()} /><Button label="Änderungen speichern" icon="checkmark" onPress={() => { updateProfile(draft); router.back(); }} /></View>
  </Screen>;
}

function Section({ icon, title, subtitle, children }: PropsWithChildren<{ icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }>) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <Card style={styles.section}><View style={styles.sectionHead}><View style={styles.sectionIcon}><Ionicons name={icon} size={20} color={theme.colors.primary} /></View><View><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionSubtitle}>{subtitle}</Text></View></View><View style={styles.fields}>{children}</View></Card>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  grid: { gap: 16 }, desktopGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }, section: { flexGrow: 1, minWidth: 320, padding: 20 }, sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }, sectionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800' }, sectionSubtitle: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }, fields: { gap: 15, marginTop: 16 }, row: { flexDirection: 'row', gap: 10 }, flex: { flex: 1, minWidth: 0 }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 },
});
