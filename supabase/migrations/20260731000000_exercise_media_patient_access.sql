-- Raise exercise-media limits for clinical demo videos.
-- Patient playback uses service-role signed URLs (see resolveExerciseMediaUrl);
-- do not grant broad authenticated SELECT on the private bucket.

update storage.buckets
set
  file_size_limit = 536870912,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-m4v'
  ]
where id = 'exercise-media';
