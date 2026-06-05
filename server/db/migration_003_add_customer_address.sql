-- Migration 003: Add address column to customers table
-- The frontend form and backend model already use this field,
-- but it was missing from the original schema.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
