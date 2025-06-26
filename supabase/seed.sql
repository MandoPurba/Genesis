-- For this script to work, make sure you have a `accounts`, `budgets`, and `transactions` table.
-- The script is idempotent and can be run multiple times.

-- Clear existing data to avoid duplicates on re-running
TRUNCATE TABLE transactions, budgets, accounts RESTART IDENTITY;

-- Note: Replace 'ba215643-9da9-47f9-a510-4e2cc847e9c4' with the actual user_id from your auth.users table if needed.
-- This ID was provided by the user.
-- Insert into accounts and capture their IDs using CTEs (Common Table Expressions)
WITH new_accounts AS (
  INSERT INTO accounts (user_id, name, type, balance, currency)
  VALUES
    ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'BCA Tahapan', 'checking', 15500000.00, 'IDR'),
    ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Mandiri Tabungan', 'savings', 50000000.00, 'IDR'),
    ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'GoPay Wallet', 'e-wallet', 750000.00, 'IDR')
  RETURNING id, name
),
bca_id AS (
  SELECT id FROM new_accounts WHERE name = 'BCA Tahapan'
),
mandiri_id AS (
  SELECT id FROM new_accounts WHERE name = 'Mandiri Tabungan'
),
gopay_id AS (
  SELECT id FROM new_accounts WHERE name = 'GoPay Wallet'
)
-- Insert transactions for the current month
INSERT INTO transactions (user_id, account_id, description, amount, type, category, date)
VALUES
  -- Current Month Income
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM bca_id), 'Gaji Bulanan', 8500000.00, 'income', 'Salary', NOW() - INTERVAL '5 days'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM mandiri_id), 'Proyek Desain Logo', 2500000.00, 'income', 'Freelance', NOW() - INTERVAL '10 days'),
  
  -- Current Month Expenses
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM bca_id), 'Sewa Apartemen', 3000000.00, 'expense', 'Housing', NOW() - INTERVAL '4 days'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM gopay_id), 'Makan Siang (Warung Padang)', 75000.00, 'expense', 'Food', NOW() - INTERVAL '3 days'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM bca_id), 'Tagihan Listrik & Air', 450000.00, 'expense', 'Utilities', NOW() - INTERVAL '2 days'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM gopay_id), 'Transportasi (Gojek)', 50000.00, 'expense', 'Transport', NOW() - INTERVAL '1 day'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM mandiri_id), 'Belanja Bulanan (Supermarket)', 1200000.00, 'expense', 'Groceries', NOW() - INTERVAL '12 days'),

  -- Last Month Income (for percentage comparison)
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM bca_id), 'Gaji Bulan Lalu', 8000000.00, 'income', 'Salary', NOW() - INTERVAL '1 month' - INTERVAL '5 days'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM mandiri_id), 'Bonus Kinerja', 1000000.00, 'income', 'Bonus', NOW() - INTERVAL '1 month' - INTERVAL '15 days'),
  
  -- Last Month Expenses (for percentage comparison)
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM bca_id), 'Sewa Apartemen Bulan Lalu', 3000000.00, 'expense', 'Housing', NOW() - INTERVAL '1 month' - INTERVAL '4 days'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', (SELECT id FROM gopay_id), 'Tiket Konser', 500000.00, 'expense', 'Entertainment', NOW() - INTERVAL '1 month' - INTERVAL '20 days');

-- Insert budgets
INSERT INTO budgets (user_id, name, amount, category)
VALUES
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Budget Makanan & Minuman', 2000000.00, 'Food'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Budget Transportasi', 500000.00, 'Transport'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Budget Hiburan', 750000.00, 'Entertainment'),
  ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'Budget Kebutuhan Rumah', 2000000.00, 'Groceries');
