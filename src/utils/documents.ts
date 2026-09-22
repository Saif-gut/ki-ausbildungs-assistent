import { Job, Profile } from '@/types';

const safe = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

export function cvHtml(profile: Profile) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;color:#12231f;margin:48px;line-height:1.5} h1{font-size:30px;margin:0} h2{font-size:16px;color:#087a65;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #dce6e1;padding-bottom:6px;margin-top:28px}.contact{color:#66756f;margin-top:5px}.grid{display:grid;grid-template-columns:150px 1fr;gap:10px}.note{font-size:10px;color:#777;margin-top:40px}
  </style></head><body><h1>${safe(profile.firstName)} ${safe(profile.lastName)}</h1><div class="contact">${safe(profile.city)} · ${safe(profile.email)} · ${safe(profile.phone)}</div>
  <h2>Schulbildung</h2><div class="grid"><b>Abschluss</b><span>${safe(profile.schoolDegree)} · voraussichtlich ${safe(profile.graduationYear)}</span><b>Schule</b><span>${safe(profile.school)}</span></div>
  <h2>Berufserfahrung</h2><p>${safe(profile.experience)}</p><h2>Praktika</h2><p>${safe(profile.internships)}</p><h2>Kenntnisse & Stärken</h2><p>${safe(profile.skills)}</p><h2>Sprachen</h2><p>${safe(profile.languages)}</p><h2>Zertifikate</h2><p>${safe(profile.certificates)}</p><h2>Interessen</h2><p>${safe(profile.interests)}</p>
  <p class="note">Entwurf – vor dem Versenden bitte alle Angaben prüfen.</p></body></html>`;
}

export function coverLetter(profile: Profile, job: Job) {
  const practicalExperience = profile.internships || profile.experience;
  return `${profile.firstName} ${profile.lastName}\n${profile.city} · ${profile.email} · ${profile.phone}\n\n${job.company}\n${job.location}\n\nBewerbung um eine Ausbildung als ${job.title}\n\nSehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich um die Ausbildung als ${job.title} ab ${job.start}. Besonders spricht mich an, dass ich dabei ${job.tasks[0].toLowerCase()} und mich fachlich weiterentwickeln kann.\n\nDerzeit strebe ich meinen ${profile.schoolDegree} im Jahr ${profile.graduationYear} an. Durch ${practicalExperience.toLowerCase()} habe ich erste praktische Einblicke gesammelt. Zu meinen Stärken und Kenntnissen gehören ${profile.skills.toLowerCase()}. Diese möchte ich engagiert in Ihr Team einbringen.\n\nGerne überzeuge ich Sie in einem persönlichen Gespräch von meiner Motivation.\n\nMit freundlichen Grüßen\n${profile.firstName} ${profile.lastName}`;
}
