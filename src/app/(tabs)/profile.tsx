import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PropsWithChildren, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button, Card, PageHeader, ProgressBar, SectionTitle } from '@/components/ui';
import { useApp } from '@/store/AppContext';
import { useAppTheme } from '@/store/ThemeContext';
import { AppTheme } from '@/theme';

export default function ProfileScreen() {
  const { profile, profileProgress } = useApp();
  const { theme, preference, setPreference } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <Screen wide>
    <PageHeader eyebrow="Profil" title="Deine Basis" subtitle="Übersichtlich gepflegt und bereit für Stellenvergleich und Bewerbungsunterlagen." action={<Button compact label="Bearbeiten" icon="create-outline" onPress={() => router.push('/profile/edit')} />} />
    <Card style={styles.identity}>
      <View style={styles.identityTop}><View style={styles.avatar}><Text style={styles.avatarText}>{profile.firstName[0]}{profile.lastName[0]}</Text></View><View style={styles.identityText}><Text style={styles.name}>{profile.firstName} {profile.lastName}</Text><Text style={styles.contact}>{profile.email}</Text><Text style={styles.contact}>{profile.city}</Text></View><View style={styles.percent}><Text style={styles.percentValue}>{profileProgress}%</Text><Text style={styles.percentLabel}>vollständig</Text></View></View>
      <ProgressBar value={profileProgress} />
      <Text style={styles.progressHint}>Je vollständiger dein Profil, desto genauer werden Lebenslauf und Anforderungsvergleich.</Text>
    </Card>

    <View style={styles.grid}>
      <ProfileSection icon="person-outline" title="Persönliche Angaben"><Row label="Kontakt" value={`${profile.email}\n${profile.phone}`} /><Row label="Wohnort" value={profile.city} /><Row label="Geburtsdatum" value={profile.birthDate} last /></ProfileSection>
      <ProfileSection icon="school-outline" title="Schulbildung"><Row label="Abschluss" value={profile.schoolDegree} /><Row label="Schule" value={profile.school} /><Row label="Abschlussjahr" value={profile.graduationYear} last /></ProfileSection>
      <ProfileSection icon="briefcase-outline" title="Berufserfahrung"><Row label="Erfahrungen" value={profile.experience} last /></ProfileSection>
      <ProfileSection icon="business-outline" title="Praktika"><Row label="Praktische Einblicke" value={profile.internships} last /></ProfileSection>
      <ProfileSection icon="sparkles-outline" title="Fähigkeiten"><Row label="Kenntnisse und Stärken" value={profile.skills} last /></ProfileSection>
      <ProfileSection icon="language-outline" title="Sprachen"><Row label="Sprachkenntnisse" value={profile.languages} last /></ProfileSection>
      <ProfileSection icon="ribbon-outline" title="Zertifikate"><Row label="Nachweise" value={profile.certificates} last /></ProfileSection>
      <ProfileSection icon="heart-outline" title="Interessen"><Row label="Interessen und Hobbys" value={profile.interests} last /></ProfileSection>
    </View>

    <SectionTitle title="Darstellung" subtitle="Wähle, wie die App auf diesem Gerät aussieht." />
    <Card style={styles.appearance}>{([['system', 'phone-portrait-outline', 'System'], ['light', 'sunny-outline', 'Hell'], ['dark', 'moon-outline', 'Dunkel']] as const).map(([value, icon, label]) => <Pressable key={value} onPress={() => setPreference(value)} style={[styles.themeChoice, preference === value && styles.themeChoiceActive]}><Ionicons name={icon} size={19} color={preference === value ? theme.colors.primary : theme.colors.textSecondary} /><Text style={[styles.themeLabel, preference === value && styles.themeLabelActive]}>{label}</Text>{preference === value && <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />}</Pressable>)}</Card>

    <View style={styles.privacy}><View style={styles.privacyIcon}><Ionicons name="shield-checkmark-outline" size={23} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.privacyTitle}>Deine Daten bleiben unter deiner Kontrolle</Text><Text style={styles.privacyText}>Geburtsdatum und Bewerbungsfoto bleiben optional. Für jede Aufgabe werden nur die benötigten Angaben verwendet.</Text></View></View>
  </Screen>;
}

function ProfileSection({ icon, title, children }: PropsWithChildren<{ icon: keyof typeof Ionicons.glyphMap; title: string }>) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <Card style={styles.sectionCard}><View style={styles.sectionHeader}><View style={styles.sectionIcon}><Ionicons name={icon} size={19} color={theme.colors.primary} /></View><Text style={styles.sectionTitle}>{title}</Text></View>{children}</Card>;
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={[styles.row, last && styles.lastRow]}><Text style={styles.label}>{label}</Text><Text style={[styles.value, !value && styles.emptyValue]}>{value || 'Noch nicht angegeben'}</Text></View>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  identity: { marginBottom: 8, gap: 14 }, identityTop: { flexDirection: 'row', alignItems: 'center', gap: 14 }, avatar: { width: 62, height: 62, borderRadius: 20, backgroundColor: theme.colors.text, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: theme.colors.background, fontSize: 18, fontWeight: '800' }, identityText: { flex: 1 }, name: { color: theme.colors.text, fontSize: 19, fontWeight: '800' }, contact: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 }, percent: { alignItems: 'flex-end' }, percentValue: { color: theme.colors.primary, fontSize: 20, fontWeight: '800' }, percentLabel: { color: theme.colors.textTertiary, fontSize: 10, marginTop: 1 }, progressHint: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 17 },
  grid: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, sectionCard: { width: '48.9%', minWidth: 280, flexGrow: 1, padding: 19, shadowOpacity: 0, elevation: 0 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }, sectionIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, sectionTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800' }, row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border }, lastRow: { borderBottomWidth: 0, paddingBottom: 0 }, label: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }, value: { color: theme.colors.text, fontSize: 13, lineHeight: 19, marginTop: 4 }, emptyValue: { color: theme.colors.textTertiary, fontStyle: 'italic' },
  appearance: { flexDirection: 'row', gap: 8, padding: 8 }, themeChoice: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: theme.radius.md, borderWidth: 1, borderColor: 'transparent' }, themeChoiceActive: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary }, themeLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700' }, themeLabelActive: { color: theme.colors.primaryStrong },
  privacy: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 17, backgroundColor: theme.colors.primarySubtle, borderRadius: theme.radius.lg, marginTop: 20, borderWidth: 1, borderColor: theme.colors.primarySoft }, privacyIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, privacyTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 13 }, privacyText: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 4 },
});
