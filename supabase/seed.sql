-- This script can be run to seed the database with dummy data.
-- It is idempotent and can be run multiple times.

-- Clear existing data to prevent duplicates. 
-- The order is important to respect foreign key constraints.
delete from public.transactions;
delete from public.budgets;
delete from public.accounts;

-- NOTE: We don't delete from 'categories' or 'profiles' because they
-- are automatically populated by triggers when a user is created.

-- == SEED ACCOUNTS ==
-- Use the user ID you provided.
-- ba215643-9da9-47f9-a510-4e2cc847e9c4
with new_accounts as (
  insert into public.accounts (user_id, name, type, balance)
  values
    ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'BCA Savings', 'Bank Account', 0),
    ('ba215643-9da9-47f9-a510-4e2cc847e9c4', 'GoPay Wallet', 'E-Wallet', 0)
  returning id, name
)
select
  (select count(*) from new_accounts) || ' accounts inserted.' as status;


-- == SEED TRANSACTIONS & BUDGETS ==
-- This block uses PL/pgSQL to dynamically get foreign keys and insert data.
do $$
declare
  user_uuid uuid := 'ba215643-9da9-47f9-a510-4e2cc847e9c4';
  bca_account_id bigint;
  gopay_account_id bigint;
  salary_category_id bigint;
  food_category_id bigint;
  transport_category_id bigint;
  shopping_category_id bigint;
begin
  -- Get Account IDs created above
  select id into bca_account_id from public.accounts where user_id = user_uuid and name = 'BCA Savings';
  select id into gopay_account_id from public.accounts where user_id = user_uuid and name = 'GoPay Wallet';
  
  -- Get Category IDs (these are created by a trigger when the user's profile is made)
  select id into salary_category_id from public.categories where user_id = user_uuid and name = 'Salary';
  select id into food_category_id from public.categories where user_id = user_uuid and name = 'Food & Drinks';
  select id into transport_category_id from public.categories where user_id = user_uuid and name = 'Transportation';
  select id into shopping_category_id from public.categories where user_id = user_uuid and name = 'Shopping';

  -- Insert transactions for the CURRENT month
  raise notice 'Inserting transactions for current month...';
  insert into public.transactions (user_id, date, type, amount, description, category_id, account_id)
  values
    (user_uuid, now(), 'income', 8000000, 'Monthly Salary', salary_category_id, bca_account_id),
    (user_uuid, now() - interval '2 days', 'expense', 150000, 'Lunch with team', food_category_id, gopay_account_id),
    (user_uuid, now() - interval '3 days', 'expense', 50000, 'GoJek Ride', transport_category_id, gopay_account_id),
    (user_uuid, now() - interval '5 days', 'expense', 350000, 'New Shoes', shopping_category_id, bca_account_id);

  -- Insert transactions for the PREVIOUS month for comparison
  raise notice 'Inserting transactions for previous month...';
  insert into public.transactions (user_id, date, type, amount, description, category_id, account_id)
  values
    (user_uuid, now() - interval '1 month', 'income', 7800000, 'Previous Month Salary', salary_category_id, bca_account_id),
    (user_uuid, now() - interval '1 month' - interval '5 days', 'expense', 1200000, 'Monthly Groceries', shopping_category_id, bca_account_id),
    (user_uuid, now() - interval '1 month' - interval '10 days', 'expense', 400000, 'Dinner and a movie', food_category_id, gopay_account_id);

  -- Recalculate account balances based on all transactions
  raise notice 'Recalculating account balances...';
  update public.accounts a
  set balance = (
    select
      coalesce(sum(case when t.type = 'income' then t.amount when t.type = 'expense' then -t.amount else 0 end), 0)
    from public.transactions t
    where t.account_id = a.id
  )
  where a.user_id = user_uuid;

  -- Insert budgets for the current month
  raise notice 'Inserting budgets...';
  insert into public.budgets (user_id, category_id, amount, period, start_date)
  values
    (user_uuid, food_category_id, 2000000, 'monthly', date_trunc('month', now())::date),
    (user_uuid, shopping_category_id, 1500000, 'monthly', date_trunc('month', now())::date);
    
  raise notice 'Seeding complete.';
end $$;
