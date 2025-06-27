-- PERHATIAN: Skrip ini akan MENGHAPUS semua data keuangan (transaksi, anggaran, akun, kategori)
-- untuk pengguna yang ditentukan di bawah ini dan menggantinya dengan data uji baru.
-- Profil pengguna tidak akan dihapus.

BEGIN;

DO $$
DECLARE
    -- === CUKUP GANTI ID PENGGUNA INI ===
    v_user_id UUID := 'ba215643-9da9-47f9-a510-4e2cc847e9c4'; 
    -- ===================================

    -- Variabel untuk menampung ID yang baru dibuat
    v_bca_account_id BIGINT;
    v_gopay_account_id BIGINT;
    v_cash_account_id BIGINT;

    v_salary_category_id BIGINT;
    v_food_category_id BIGINT;
    v_transport_category_id BIGINT;
    v_shopping_category_id BIGINT;
    v_utils_category_id BIGINT;
    v_entertainment_category_id BIGINT;
    v_health_category_id BIGINT;
    v_gifts_category_id BIGINT;

    v_month_start DATE;
    v_expense_categories BIGINT[];
    v_all_accounts BIGINT[];
BEGIN
    -- 1. Hapus data lama yang ada untuk pengguna ini (urutan penting karena ada foreign key)
    RAISE NOTICE 'Menghapus data lama untuk pengguna: %', v_user_id;
    DELETE FROM public.transactions WHERE user_id = v_user_id;
    DELETE FROM public.budgets WHERE user_id = v_user_id;
    DELETE FROM public.accounts WHERE user_id = v_user_id;
    DELETE FROM public.categories WHERE user_id = v_user_id;

    -- 2. Buat Akun baru dan simpan ID mereka
    RAISE NOTICE 'Membuat akun baru...';
    INSERT INTO public.accounts (user_id, name, type) VALUES (v_user_id, 'Rekening Bank Utama', 'Bank Account') RETURNING id INTO v_bca_account_id;
    INSERT INTO public.accounts (user_id, name, type) VALUES (v_user_id, 'Dompet Digital', 'E-Wallet') RETURNING id INTO v_gopay_account_id;
    INSERT INTO public.accounts (user_id, name, type) VALUES (v_user_id, 'Uang Tunai', 'Cash') RETURNING id INTO v_cash_account_id;

    -- 3. Buat Kategori baru dan simpan ID mereka
    RAISE NOTICE 'Membuat kategori baru...';
    -- Income
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Salary', 'income') RETURNING id INTO v_salary_category_id;
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Gifts', 'income') RETURNING id INTO v_gifts_category_id;
    -- Expense
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Food & Drinks', 'expense') RETURNING id INTO v_food_category_id;
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Transportation', 'expense') RETURNING id INTO v_transport_category_id;
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Shopping', 'expense') RETURNING id INTO v_shopping_category_id;
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Utility Bills', 'expense') RETURNING id INTO v_utils_category_id;
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Entertainment', 'expense') RETURNING id INTO v_entertainment_category_id;
    INSERT INTO public.categories (user_id, name, type) VALUES (v_user_id, 'Health', 'expense') RETURNING id INTO v_health_category_id;

    -- 4. Buat Anggaran (Budget) untuk bulan ini
    RAISE NOTICE 'Membuat anggaran untuk bulan ini...';
    INSERT INTO public.budgets (user_id, category_id, amount, period, start_date) VALUES 
      (v_user_id, v_food_category_id, 1500000, 'monthly', date_trunc('month', NOW())),
      (v_user_id, v_transport_category_id, 750000, 'monthly', date_trunc('month', NOW())),
      (v_user_id, v_shopping_category_id, 1000000, 'monthly', date_trunc('month', NOW()));

    -- Siapkan array untuk pemilihan acak nanti
    v_expense_categories := ARRAY[
        v_food_category_id,
        v_transport_category_id,
        v_shopping_category_id,
        v_utils_category_id,
        v_entertainment_category_id,
        v_health_category_id
    ];
    v_all_accounts := ARRAY[
        v_bca_account_id,
        v_gopay_account_id,
        v_cash_account_id
    ];

    -- 5. Buat data transaksi selama 12 bulan terakhir
    RAISE NOTICE 'Membuat data transaksi selama 12 bulan...';
    FOR i IN REVERSE 11..0 LOOP
        v_month_start := date_trunc('month', NOW() - (i * INTERVAL '1 month'));

        -- Tambahkan gaji bulanan ke rekening bank
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, date, description)
        VALUES (
            v_user_id,
            v_bca_account_id,
            v_salary_category_id,
            'income',
            7000000 + (random() * 2000000 - 1000000), -- Gaji antara 6jt dan 8jt
            v_month_start + (floor(random() * 4) || ' days')::interval,
            'Gaji Bulanan (Data Uji)'
        );
        
        -- Tambahkan beberapa pemasukan kecil lainnya
        IF random() > 0.6 THEN
            INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, date, description)
            VALUES (
                v_user_id,
                v_all_accounts[1 + floor(random() * array_length(v_all_accounts, 1))],
                v_gifts_category_id,
                'income',
                50000 + (random() * 450000), -- Antara 50rb dan 500rb
                v_month_start + (floor(random() * 28) || ' days')::interval,
                'Hadiah/Bonus (Data Uji)'
            );
        END IF;

        -- Tambahkan pengeluaran acak (antara 15 dan 30 pengeluaran per bulan)
        FOR j IN 1..(15 + floor(random() * 16)) LOOP
            INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, date, description)
            VALUES (
                v_user_id,
                v_all_accounts[1 + floor(random() * array_length(v_all_accounts, 1))],
                v_expense_categories[1 + floor(random() * array_length(v_expense_categories, 1))],
                'expense',
                10000 + (random() * 490000), -- Pengeluaran antara 10rb dan 500rb
                v_month_start + (floor(random() * 28) || ' days')::interval,
                'Contoh Pengeluaran ' || j
            );
        END LOOP;
        
        -- Tambahkan 1-3 transfer antar akun
        FOR k IN 1..(1 + floor(random() * 3)) LOOP
            INSERT INTO public.transactions (user_id, type, amount, date, description, account_id, to_account_id)
            VALUES (
                v_user_id,
                'transfer',
                50000 + (random() * 950000), -- Transfer antara 50rb dan 1jt
                v_month_start + (floor(random() * 28) || ' days')::interval,
                'Transfer Antar Akun (Data Uji)',
                v_bca_account_id,
                v_gopay_account_id
            );
        END LOOP;

    END LOOP;
END $$;

COMMIT;

RAISE NOTICE 'Skrip Selesai! Data uji telah berhasil dibuat.';
