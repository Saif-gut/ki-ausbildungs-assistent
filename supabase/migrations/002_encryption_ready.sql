-- Optional envelope for a later client-side encryption migration.
-- The client will encrypt selected profile fields before they reach Supabase.
alter table public.profiles
  add column if not exists private_profile_envelope jsonb,
  add column if not exists private_profile_encryption_version integer;

comment on column public.profiles.private_profile_envelope is
  'Client-encrypted JSON envelope, e.g. algorithm, iv and ciphertext. Never decrypt in Postgres.';
comment on column public.profiles.private_profile_encryption_version is
  'Key/envelope version used by the client for migrations and rotation.';

alter table public.profiles add constraint private_profile_envelope_has_version
  check (private_profile_envelope is null or private_profile_encryption_version is not null);

