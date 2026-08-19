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
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- 4. Seed Initial Sample Menu Data
INSERT INTO public.menu_items (name, price, category, station) VALUES
('Seekh Kabab Plate', 12.99, 'BBQ', 'BBQ'),
('Chicken Tikka Boti', 14.50, 'BBQ', 'BBQ'),
('Mutton Ribs BBQ', 18.99, 'BBQ', 'BBQ'),
('Smash Cheeseburger', 9.99, 'Fast Food', 'Fast Food'),
('Loaded Fries', 6.50, 'Fast Food', 'Fast Food'),
('Crispy Chicken Wings', 8.99, 'Fast Food', 'Fast Food'),
('Fresh Mango Lassi', 4.50, 'Drinks', 'Drinks'),
('Mint Lemonade', 3.99, 'Drinks', 'Drinks'),
('Karak Masala Chai', 2.99, 'Drinks', 'Drinks'),
('Chicken Karahi Special', 16.99, 'Desi', 'Desi'),
('Chicken Biryani', 11.99, 'Desi', 'Desi')
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
