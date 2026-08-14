-- Media opcional por carta: {"tipo": "imagen"|"video", "url": "..."}
-- Los archivos viven en el bucket público 'media' de Storage.
alter table public.cards add column media jsonb;
