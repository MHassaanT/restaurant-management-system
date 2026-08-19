-- Supabase Database Schema & Realtime Setup for Restaurant Prototype

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number INT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Available', 'Occupied', 'Waiting for Food', 'Clearing')) DEFAULT 'Available',
    qr_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    station TEXT NOT NULL CHECK (station IN ('BBQ', 'Fast Food', 'Drinks', 'Desi')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Preparing', 'Ready', 'Delivered')) DEFAULT 'Pending',
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT,
    modifiers TEXT DEFAULT '',
    station TEXT NOT NULL CHECK (station IN ('BBQ', 'Fast Food', 'Drinks', 'Desi')),
    status TEXT NOT NULL CHECK (status IN ('Preparing', 'Ready')) DEFAULT 'Preparing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) and allow public read/write for prototype demo
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to tables" ON public.tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- 3. Enable Supabase Realtime Subscriptions for all tables
ALTER PUBLICATION supabase_realtime SET TABLE public.tables, public.menu_items, public.orders, public.order_items;

-- 4. Seed Initial Sample Menu Data
INSERT INTO public.menu_items (name, price, category, station) VALUES
('Seekh Kabab Plate', 1250.00, 'BBQ', 'BBQ'),
('Chicken Tikka Boti', 1450.00, 'BBQ', 'BBQ'),
('Mutton Ribs BBQ', 2200.00, 'BBQ', 'BBQ'),
('Smash Cheeseburger', 950.00, 'Fast Food', 'Fast Food'),
('Loaded Fries', 650.00, 'Fast Food', 'Fast Food'),
('Crispy Chicken Wings', 850.00, 'Fast Food', 'Fast Food'),
('Fresh Mango Lassi', 450.00, 'Drinks', 'Drinks'),
('Mint Lemonade', 350.00, 'Drinks', 'Drinks'),
('Karak Masala Chai', 250.00, 'Drinks', 'Drinks'),
('Chicken Karahi Special', 1850.00, 'Desi', 'Desi'),
('Chicken Biryani', 750.00, 'Desi', 'Desi')
ON CONFLICT DO NOTHING;

-- 5. Seed Default Tables (1 through 10)
DO $$
DECLARE
    t_num INT;
BEGIN
    FOR t_num IN 1..10 LOOP
        INSERT INTO public.tables (table_number, status, qr_token)
        VALUES (t_num, 'Available', 'tbl_' || t_num || '_' || md5(t_num::text))
        ON CONFLICT (table_number) DO NOTHING;
    END LOOP;
END $$;
