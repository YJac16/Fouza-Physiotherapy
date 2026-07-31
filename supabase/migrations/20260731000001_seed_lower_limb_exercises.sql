-- Seed lower-limb exercise library entries (media paths in exercise-media bucket).
-- Upload matching files from public/Lower limb videos/ before patients can play them.

insert into public.exercises (name, slug, category, media_url, description, is_active)
values
  (
    'Clearing test — squat',
    'clearing-test-squat',
    'ankle',
    'lower-limb/ankle/clearing-test-squat.mp4',
    'Lower-limb clearing test: squat.',
    true
  ),
  (
    'Flexibility test — active knee extension',
    'flexibility-test-active-knee-ext',
    'ankle',
    'lower-limb/ankle/flexibility-test-active-knee-ext.mp4',
    'Active knee extension flexibility test (ankle set).',
    true
  ),
  (
    'Ankle palpation',
    'ankle-palpation',
    'ankle',
    'lower-limb/ankle/ankle-palpation.mp4',
    'Ankle palpation demonstration.',
    true
  ),
  (
    'Hip isometric abduction and adduction',
    'hip-isometric-abd-add',
    'hip',
    'lower-limb/hip/hip-isometric-abd-add.mp4',
    'Hip isometric abduction and adduction.',
    true
  ),
  (
    'Hip palpation',
    'hip-palpation',
    'hip',
    'lower-limb/hip/hip-palpation.mp4',
    'Hip palpation demonstration.',
    true
  ),
  (
    'Flexibility test — piriformis length',
    'piriformis-length-test',
    'hip',
    'lower-limb/hip/piriformis-length-test.mp4',
    'Piriformis length flexibility test.',
    true
  ),
  (
    'Flexibility test — Thomas test',
    'thomas-test',
    'hip',
    'lower-limb/hip/thomas-test.mp4',
    'Thomas test for hip flexor length.',
    true
  ),
  (
    'NMS functional tests — lower limb',
    'nms-functional-tests-lower',
    'hip',
    'lower-limb/hip/nms-functional-tests-lower.mp4',
    'Neuromusculoskeletal functional tests for the lower limb. Upload as mp4 for browser playback.',
    true
  ),
  (
    'Flexibility test — active knee extension (knee)',
    'knee-flexibility-active-knee-ext',
    'knee',
    'lower-limb/knee/flexibility-test-active-knee-ext.mp4',
    'Active knee extension flexibility test (knee set).',
    true
  ),
  (
    'Lumbar spine assessment',
    'lumbar-spine-assessment',
    'lumbar',
    'lower-limb/lumbar/lumbar-spine-assessment.mp4',
    'Lumbar spine assessment demonstration.',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  media_url = excluded.media_url,
  description = excluded.description,
  is_active = true,
  updated_at = timezone('utc', now());
