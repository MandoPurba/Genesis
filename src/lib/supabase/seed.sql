-- SEBELUM MENJALANKAN, HARAP GANTI NILAI PLACEHOLDER DI BAWAH INI!
-- Anda dapat menemukan ID ini dengan melihat tabel 'accounts' dan 'categories' Anda di Supabase.

DO $$
DECLARE
    -- === GANTI NILAI-NILAI INI ===
    v_user_id UUID := 'ba215643-9da9-47f9-a510-4e2cc847e9c4'; -- ID Pengguna Anda telah diisi
    v_account_id BIGINT := 1;      -- GANTI dengan ID dari salah satu akun Anda di tabel `accounts`
    v_salary_category_id BIGINT := 1; -- GANTI dengan ID kategori 'Salary' Anda
    v_food_category_id BIGINT := 2;   -- GANTI dengan ID kategori 'Food & Drinks' Anda
    v_transport_category_id BIGINT := 3; -- GANTI dengan ID kategori 'Transportation' Anda
    v_shopping_category_id BIGINT := 4; -- GANTI dengan ID kategori 'Shopping' Anda
    v_utils_category_id BIGINT := 5;    -- GANTI dengan ID kategori 'Utility Bills' Anda
    -- ============================

    v_month_start DATE;
    v_expense_categories BIGINT[];
BEGIN
    -- Array ID kategori pengeluaran untuk pemilihan acak
    v_expense_categories := ARRAY[
        v_food_category_id,
        v_transport_category_id,
        v_shopping_category_id,
        v_utils_category_id
    ];

    -- Ulangi untuk 12 bulan terakhir
    FOR i IN REVERSE 11..0 LOOP
        v_month_start := date_trunc('month', NOW() - (i * INTERVAL '1 month'));

        -- 1. Tambahkan gaji bulanan
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, date, description)
        VALUES (
            v_user_id,
            v_account_id,
            v_salary_category_id,
            'income',
            5000000 + (random() * 2000000 - 1000000), -- Gaji antara 4jt dan 6jt
            v_month_start + (floor(random() * 4) || ' days')::interval, -- Hari acak dalam 5 hari pertama
            'Gaji Bulanan (Data Uji)'
        );

        -- 2. Tambahkan pengeluaran acak untuk bulan tersebut (antara 5 dan 15 pengeluaran)
        FOR j IN 1..(5 + floor(random() * 11)) LOOP
            INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, date, description)
            VALUES (
                v_user_id,
                v_account_id,
                v_expense_categories[1 + floor(random() * array_length(v_expense_categories, 1))],
                'expense',
                10000 + (random() * 490000), -- Pengeluaran antara 10rb dan 500rb
                v_month_start + (floor(random() * 28) || ' days')::interval, -- Hari acak dalam sebulan
                'Contoh Pengeluaran ' || j
            );
        END LOOP;
    END LOOP;
END $$;
