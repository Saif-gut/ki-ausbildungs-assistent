import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, ReactNode, useEffect, useMemo, useState } from 'react';
import { Animated, GestureResponderEvent, Platform, Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { AppTheme } from '@/theme';
import { useAppTheme } from '@/store/ThemeContext';

export function Card({ children, style, subtle = false }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; subtle?: boolean }>) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={[styles.card, subtle && styles.subtleCard, style]}>{children}</View>;
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={styles.pageHeader}><View style={{ flex: 1 }}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.pageTitle}>{title}</Text>{subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}</View>{action}</View>;
}

export function SectionTitle({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={styles.sectionRow}><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>{title}</Text>{subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}</View>{action && <Pressable hitSlop={10} onPress={onAction}><Text style={styles.link}>{action}</Text></Pressable>}</View>;
}

export function Button({ label, icon, onPress, variant = 'primary', disabled, compact }: { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; disabled?: boolean; compact?: boolean }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  const iconColor = variant === 'primary' ? theme.colors.white : variant === 'danger' ? theme.colors.danger : theme.colors.primary;
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, styles[`${variant}Button`], compact && styles.compactButton, (pressed || disabled) && styles.pressed]}>
    {icon && <Ionicons name={icon} size={compact ? 16 : 18} color={iconColor} />}<Text style={[styles.buttonText, variant !== 'primary' && styles.secondaryButtonText, variant === 'danger' && { color: theme.colors.danger }]}>{label}</Text>
  </Pressable>;
}

export function IconButton({ icon, onPress, selected, label }: { icon: keyof typeof Ionicons.glyphMap; onPress?: (event: GestureResponderEvent) => void; selected?: boolean; label: string }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, selected && styles.iconButtonSelected, pressed && styles.pressed]}><Ionicons name={icon} size={21} color={theme.colors.primary} /></Pressable>;
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} placeholderTextColor={theme.colors.textTertiary} style={[styles.input, props.multiline && styles.multiline, props.style]} />{hint && <Text style={styles.fieldHint}>{hint}</Text>}</View>;
}

export function Badge({ children, tone = 'neutral', icon }: PropsWithChildren<{ tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'; icon?: keyof typeof Ionicons.glyphMap }>) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  const palette = { primary: [theme.colors.primarySoft, theme.colors.primaryStrong], success: [theme.colors.successSoft, theme.colors.success], warning: [theme.colors.warningSoft, theme.colors.warning], danger: [theme.colors.dangerSoft, theme.colors.danger], neutral: [theme.colors.surfaceMuted, theme.colors.textSecondary] }[tone];
  return <View style={[styles.badge, { backgroundColor: palette[0] }]}>{icon && <Ionicons name={icon} size={13} color={palette[1]} />}<Text style={[styles.badgeText, { color: palette[1] }]}>{children}</Text></View>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <View>{label && <View style={styles.progressLabel}><Text style={styles.progressLabelText}>{label}</Text><Text style={styles.progressValue}>{value}%</Text></View>}<View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} /></View></View>;
}

export function EmptyState({ icon, title, body, action }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; action?: ReactNode }) {
  const { theme } = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  return <Card style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={25} color={theme.colors.primary} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text>{action}</Card>;
}

export function FadeIn({ children, delay = 0, style }: PropsWithChildren<{ delay?: number; style?: ViewStyle }>) {
  const [opacity] = useState(() => new Animated.Value(0)); const [translateY] = useState(() => new Animated.Value(8));
  useEffect(() => { const useNativeDriver = Platform.OS !== 'web'; Animated.parallel([Animated.timing(opacity, { toValue: 1, duration: 280, delay, useNativeDriver }), Animated.timing(translateY, { toValue: 0, duration: 280, delay, useNativeDriver })]).start(); }, [delay, opacity, translateY]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow },
  subtleCard: { backgroundColor: theme.colors.surfaceMuted, shadowOpacity: 0, elevation: 0 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  eyebrow: { color: theme.colors.primary, fontSize: theme.type.caption, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 },
  pageTitle: { color: theme.colors.text, fontSize: theme.type.display, lineHeight: 38, fontWeight: '800', letterSpacing: -0.7 },
  pageSubtitle: { color: theme.colors.textSecondary, fontSize: theme.type.body, lineHeight: 22, marginTop: 7, maxWidth: 620 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.md, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  sectionTitle: { color: theme.colors.text, fontSize: theme.type.h2, fontWeight: '800', letterSpacing: -0.25 },
  sectionSubtitle: { color: theme.colors.textSecondary, fontSize: theme.type.small, lineHeight: 19, marginTop: 4 },
  link: { color: theme.colors.primary, fontSize: theme.type.small, fontWeight: '700', paddingBottom: 2 },
  button: { minHeight: 52, paddingHorizontal: 20, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, borderWidth: 1 },
  compactButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: theme.radius.sm },
  primaryButton: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, secondaryButton: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }, ghostButton: { backgroundColor: 'transparent', borderColor: 'transparent' }, dangerButton: { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.dangerSoft },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] }, buttonText: { color: theme.colors.white, fontSize: theme.type.body, fontWeight: '700' }, secondaryButtonText: { color: theme.colors.primary },
  iconButton: { width: 44, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }, iconButtonSelected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  field: { gap: 7 }, fieldLabel: { fontSize: theme.type.small, color: theme.colors.text, fontWeight: '700' }, fieldHint: { fontSize: theme.type.caption, color: theme.colors.textSecondary, lineHeight: 16 },
  input: { minHeight: 50, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, paddingHorizontal: 15, color: theme.colors.text, fontSize: theme.type.body }, multiline: { minHeight: 104, paddingTop: 14, textAlignVertical: 'top' },
  badge: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: theme.radius.pill, flexDirection: 'row', alignItems: 'center', gap: 5 }, badgeText: { fontSize: theme.type.caption, fontWeight: '700' },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }, progressLabelText: { color: theme.colors.textSecondary, fontSize: theme.type.small, fontWeight: '600' }, progressValue: { color: theme.colors.primary, fontSize: theme.type.small, fontWeight: '800' },
  progressTrack: { height: 7, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill },
  empty: { alignItems: 'center', gap: 9, paddingVertical: 36 }, emptyIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { fontSize: theme.type.h3, fontWeight: '800', color: theme.colors.text }, emptyBody: { fontSize: theme.type.small, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 340 },
});
