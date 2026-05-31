-- ====================================================
-- UP MIGRATION
-- ====================================================
BEGIN;

-- 1. Safely add the missing bill_id column
ALTER TABLE customer_transactions
ADD COLUMN IF NOT EXISTS bill_id INT REFERENCES bills(id) ON DELETE SET NULL;

-- 2. Migrate existing transaction data to the new canonical representations
-- Maps legacy business logic ('credit'/'payment') to the new validators ('given'/'received') safely.
UPDATE customer_transactions SET type = 'given' WHERE type = 'credit';
UPDATE customer_transactions SET type = 'received' WHERE type = 'payment';

-- 3. Drop the legacy constraint safely using default Postgres naming conventions
ALTER TABLE customer_transactions DROP CONSTRAINT IF EXISTS customer_transactions_type_check;

-- 4. Apply the new stringent CHECK constraint aligned with the application API
ALTER TABLE customer_transactions 
ADD CONSTRAINT customer_transactions_type_check 
CHECK (type IN ('given', 'received'));

COMMIT;

-- ====================================================
-- DOWN MIGRATION (ROLLBACK STRATEGY)
-- ====================================================
/*
BEGIN;

-- 1. Revert transaction data back to the old string representations
UPDATE customer_transactions SET type = 'credit' WHERE type = 'given';
UPDATE customer_transactions SET type = 'payment' WHERE type = 'received';

-- 2. Restore the original constraint mapping
ALTER TABLE customer_transactions DROP CONSTRAINT IF EXISTS customer_transactions_type_check;

ALTER TABLE customer_transactions 
ADD CONSTRAINT customer_transactions_type_check 
CHECK (type IN ('credit', 'payment'));

-- 3. Safely drop the bill tracking column
ALTER TABLE customer_transactions DROP COLUMN IF EXISTS bill_id;

COMMIT;
*/