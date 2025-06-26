-- This script provides seed data for the application.
-- You can run this file in your Supabase SQL Editor.

-- NOTE: Ensure you have created the 'accounts', 'budgets', and 'transactions' tables
-- with appropriate columns and RLS policies before running this script.

-- Seed Accounts
-- We are defining UUIDs for accounts so we can reference them in transactions.
INSERT INTO accounts (id, user_id, name, type, balance, currency)
VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ba215643-9da9-47f9-a510-4e2cc847e9c4', 'BCA Tahapan', 'checking', 25000000, 'IDR'),
('74b8a7c6-51a0-4a8a-9c7b-3b6e8a4f9a0d', 'ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Gopay', 'ewallet', 750000, 'IDR');

-- Seed Budgets
-- Budgets for the current month.
INSERT INTO budgets (user_id, category, amount, "month")
VALUES
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Food & Dining', 2000000, date_trunc('month', current_date)),
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Transportation', 500000, date_trunc('month', current_date)),
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Shopping', 1500000, date_trunc('month', current_date)),
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Entertainment', 750000, date_trunc('month', current_date));

-- Seed Transactions
-- A mix of income and expenses for the current month.
-- Note: Expenses are represented with negative amounts.
INSERT INTO transactions (user_id, account_id, description, amount, category, type, date)
VALUES
-- Income
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Gaji Bulanan', 30000000, 'Salary', 'income', current_date - interval '5 days'),
-- Expenses from BCA
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Makan siang kantor', -75000, 'Food & Dining', 'expense', current_date - interval '4 days'),
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Belanja Bulanan', -1200000, 'Groceries', 'expense', current_date - interval '3 days'),
('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Tagihan Listrik', -550000, 'Utilities', 'expense', current_date - interval '2 days'),
-- Expenses from Gopay
('ba215643-9da9-47f9-a510-4e2cc847e9c4', '74b8a7c6-51a0-4a8a-9c7b-3b6e8a4f9a0d', 'Kopi Pagi', -25000, 'Food & Dining', 'expense', current_date - interval '4 days'),
('ba215643-9da9-47f9-a510-4e2cc847e9c4', '74b8a7c6-51a0-4a8a-9c7b-3b6e8a4f9a0d', 'Ojek Online', -15000, 'Transportation', 'expense', current_date - interval '3 days'),
('ba215643-9da9-47f9-a510-4e2cc847e9c4', '74b8a7c6-51a0-4a8a-9c7b-3b6e8a4f9a0d', 'Nonton Bioskop', -100000, 'Entertainment', 'expense', current_date - interval '1 day');
