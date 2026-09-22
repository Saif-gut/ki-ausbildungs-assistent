import assert from 'node:assert/strict';
import test from 'node:test';
import { minimizeRequest } from '../src/ai/privacy/minimize';

test('Bewerbungsdaten werden auf relevante Felder reduziert', () => {
  const result = minimizeRequest({
    message: 'Erstelle für Mira eine Bewerbung. E-Mail: mira@example.de',
    profile: {
      firstName: 'Mira', lastName: 'Becker', email: 'mira@example.de', phone: '0151 1234567',
      birthDate: '2009-02-03', address: 'Teststraße 1', photoPath: '/private/photo.jpg',
      schoolDegree: 'Realschulabschluss', experience: 'Schulpraktikum', skills: ['Teamarbeit'],
    },
  }, 'application');

  assert.deepEqual(result.request.profile, {
    schoolDegree: 'Realschulabschluss', experience: 'Schulpraktikum', skills: ['Teamarbeit'],
  });
  assert.ok(!result.request.message.includes('Mira'));
  assert.ok(!result.request.message.includes('mira@example.de'));
  assert.ok(result.redactedFields.includes('phone'));
  assert.ok(result.redactedFields.includes('photoPath'));
});

test('Begrüßungen übertragen gar kein Profil', () => {
  const result = minimizeRequest({ message: 'Hallo', profile: { firstName: 'Mira', skills: ['HTML'] } }, 'greeting');
  assert.equal(result.request.profile, undefined);
});

test('freie Kontaktangaben werden auch ohne passendes Profil entfernt', () => {
  const result = minimizeRequest({
    message: 'Meine E-Mail ist test.person@example.de und meine Nummer ist +49 151 23456789.',
    conversation: [{ role: 'user', content: 'Ich wohne in Teststraße 17.' }],
  }, 'unknown');
  assert.ok(!result.request.message.includes('example.de'));
  assert.ok(!result.request.message.includes('23456789'));
  assert.ok(!result.request.conversation?.[0].content.includes('Teststraße'));
  assert.ok(result.redactedFields.includes('prompt.email'));
  assert.ok(result.redactedFields.includes('conversation.address'));
});
