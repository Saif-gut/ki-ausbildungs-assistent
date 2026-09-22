import { Platform, ViewStyle } from 'react-native';

const shared = {
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 },
  type: { display: 32, h1: 27, h2: 20, h3: 16, body: 15, small: 13, caption: 11 },
};

const lightColors = {
  background: '#F5F7F6', surface: '#FFFFFF', surfaceRaised: '#FFFFFF', surfaceMuted: '#EDF2F0',
  text: '#10221D', textSecondary: '#65736E', textTertiary: '#899590',
  primary: '#087461', primaryStrong: '#075B4D', primarySoft: '#E3F3EE', primarySubtle: '#F1F8F6',
  border: '#DCE5E1', borderStrong: '#C7D5CF', success: '#167A5C', successSoft: '#E4F4ED',
  warning: '#9A6817', warningSoft: '#FFF3D9', danger: '#B84A4A', dangerSoft: '#FCE9E7',
  info: '#386D9B', infoSoft: '#EAF2F8', white: '#FFFFFF', overlay: 'rgba(7, 29, 23, 0.06)',
};

const darkColors: typeof lightColors = {
  background: '#0E1513', surface: '#16201D', surfaceRaised: '#1A2723', surfaceMuted: '#202E2A',
  text: '#F0F5F3', textSecondary: '#A8B7B1', textTertiary: '#7F918A',
  primary: '#5DD6B5', primaryStrong: '#83E3C8', primarySoft: '#173B32', primarySubtle: '#132A24',
  border: '#2B3A35', borderStrong: '#3B4D47', success: '#6CD3AE', successSoft: '#18382F',
  warning: '#F0BD62', warningSoft: '#3A2D18', danger: '#F08A85', dangerSoft: '#3A2221',
  info: '#8BBBE8', infoSoft: '#1C3042', white: '#FFFFFF', overlay: 'rgba(0, 0, 0, 0.22)',
};

const makeShadow = (dark: boolean): ViewStyle => Platform.select({
  web: { boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.24)' : '0 10px 28px rgba(17,49,40,0.07)' } as ViewStyle,
  default: { shadowColor: '#071D17', shadowOffset: { width: 0, height: 7 }, shadowOpacity: dark ? 0.25 : 0.08, shadowRadius: 16, elevation: dark ? 4 : 3 },
})!;

export const lightTheme = { ...shared, dark: false, colors: lightColors, shadow: makeShadow(false) };
export const darkTheme = { ...shared, dark: true, colors: darkColors, shadow: makeShadow(true) };
export type AppTheme = typeof lightTheme;

