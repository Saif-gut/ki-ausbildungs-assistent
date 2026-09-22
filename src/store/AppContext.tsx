import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Application, ApplicationStatus, Profile } from '@/types';

const STORAGE_KEY = 'ausbildungskompass-state-v1';

const initialProfile: Profile = {
  firstName: 'Mira',
  lastName: 'Becker',
  city: 'Hamburg',
  email: 'mira.becker@beispiel.de',
  phone: '0151 23456789',
  birthDate: '',
  schoolDegree: 'Realschulabschluss',
  school: 'Stadtteilschule Nord',
  graduationYear: '2027',
  experience: 'Mitarbeit bei der Schülerzeitung',
  internships: 'Zweiwöchiges Schulpraktikum im Einzelhandel',
  skills: 'Zuverlässigkeit, Teamarbeit, MS Office, PC-Hardware, erste HTML-Kenntnisse',
  languages: 'Deutsch (Muttersprache), Englisch (gut)',
  certificates: '',
  interests: 'Technik, Programmieren, Social Media, Volleyball',
};

type AppState = {
  profile: Profile;
  applications: Application[];
  savedJobIds: string[];
  profileProgress: number;
  updateProfile: (profile: Profile) => void;
  toggleSaved: (jobId: string) => void;
  setApplicationStatus: (jobId: string, status: ApplicationStatus) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState(initialProfile);
  const [applications, setApplications] = useState<Application[]>([
    { jobId: 'kaufmann-ecommerce', status: 'Bewerbung fertig', updatedAt: 'Heute' },
  ]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['fachinformatiker-systemintegration']);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const data = JSON.parse(raw) as { profile: Profile; applications: Application[]; savedJobIds: string[] };
        setProfile({ ...initialProfile, ...data.profile });
        const statusMap: Record<string, ApplicationStatus> = { Gespeichert: 'Entwurf', Vorbereitet: 'Bewerbung fertig', Beworben: 'Gesendet', Gespräch: 'Vorstellungsgespräch' };
        setApplications(data.applications.map((item) => ({ ...item, status: statusMap[item.status] ?? item.status })));
        setSavedJobIds(data.savedJobIds);
      }
    }).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, applications, savedJobIds }));
  }, [profile, applications, savedJobIds, hydrated]);

  const value = useMemo<AppState>(() => ({
    profile,
    applications,
    savedJobIds,
    profileProgress: Math.round((Object.values(profile).filter(Boolean).length / Object.keys(profile).length) * 100),
    updateProfile: setProfile,
    toggleSaved: (jobId) => setSavedJobIds((ids) => ids.includes(jobId) ? ids.filter((id) => id !== jobId) : [...ids, jobId]),
    setApplicationStatus: (jobId, status) => setApplications((items) => {
      const existing = items.find((item) => item.jobId === jobId);
      return existing
        ? items.map((item) => item.jobId === jobId ? { ...item, status, updatedAt: 'Gerade eben' } : item)
        : [...items, { jobId, status, updatedAt: 'Gerade eben' }];
    }),
  }), [profile, applications, savedJobIds]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp muss innerhalb von AppProvider verwendet werden.');
  return context;
}
