-- Migration to safely add the missing bill_id column to customer_transactions table

ALTER TABLE customer_transactions
ADD COLUMN IF NOT EXISTS bill_id INT
REFERENCES bills(id)
ON DELETE SET NULL;
