ALTER TABLE products
ADD COLUMN name_translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN description_translations JSONB DEFAULT '{}'::jsonb;

ALTER TABLE categories
ADD COLUMN name_translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN description_translations JSONB DEFAULT '{}'::jsonb;
