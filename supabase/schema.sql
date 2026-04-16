-- HeritageKart Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile data" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND auth.role() <> 'service_role'
       AND NOT EXISTS (
           SELECT 1 FROM public.profiles p
           WHERE p.id = auth.uid() AND p.role = 'admin'
       ) THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS protect_profile_role_changes ON public.profiles;
CREATE TRIGGER protect_profile_role_changes
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ============================================
-- 3. ARTIFACTS TABLE (Products)
-- ============================================
CREATE TABLE IF NOT EXISTS public.artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    authenticity_status TEXT DEFAULT 'pending' CHECK (authenticity_status IN ('pending', 'verified', 'rejected')),
    cultural_tags TEXT[] DEFAULT '{}',
    origin_period TEXT,
    origin_location TEXT,
    dimensions TEXT,
    material TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- Artifacts policies
CREATE POLICY "Active artifacts are viewable by everyone" ON public.artifacts
    FOR SELECT USING (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

CREATE POLICY "Only admins can manage artifacts" ON public.artifacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ============================================
-- 4. CART_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artifact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, artifact_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Cart policies
CREATE POLICY "Users can view their own cart" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. ADDRESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Addresses policies
CREATE POLICY "Users can view their own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shipping_address JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = user_id OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ============================================
-- 7. ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    artifact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE SET NULL,
    artifact_title TEXT NOT NULL,
    artifact_image TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10, 2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            ))
        )
    );

CREATE POLICY "Users can create order items for their orders" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'HK' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_order_insert
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Function to update stock on order
CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.artifacts
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.artifact_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER after_order_item_insert
    AFTER INSERT ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION update_stock_on_order();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_artifacts_updated_at
    BEFORE UPDATE ON public.artifacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Categories
-- ============================================
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Statues & Sculptures', 'statues-sculptures', 'Ancient and modern statues, idols, and sculptural masterpieces', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400'),
('Manuscripts & Books', 'manuscripts-books', 'Historical manuscripts, rare books, and ancient texts', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Coins & Currency', 'coins-currency', 'Antique coins, historical currency, and numismatic collectibles', 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400'),
('Paintings & Art', 'paintings-art', 'Traditional paintings, folk art, and artistic masterpieces', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400'),
('Textiles & Fabrics', 'textiles-fabrics', 'Vintage textiles, traditional fabrics, and heritage weaves', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400'),
('Jewelry & Ornaments', 'jewelry-ornaments', 'Antique jewelry, traditional ornaments, and heritage accessories', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'),
('Pottery & Ceramics', 'pottery-ceramics', 'Ancient pottery, ceramic artifacts, and terracotta collectibles', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400'),
('Weapons & Armor', 'weapons-armor', 'Historical weapons, shields, and ceremonial armor', 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Sample Artifacts
-- ============================================
INSERT INTO public.artifacts (title, slug, description, price, quantity, category_id, images, authenticity_status, cultural_tags, origin_period, origin_location, is_featured, is_active) VALUES
(
    'Bronze Dancing Nataraja',
    'bronze-dancing-nataraja',
    'Exquisite Chola-style bronze sculpture of Lord Shiva as Nataraja, the cosmic dancer. This masterpiece captures the divine dance of creation and destruction with intricate detailing on the ring of fire and graceful pose.',
    45000.00,
    3,
    (SELECT id FROM public.categories WHERE slug = 'statues-sculptures'),
    ARRAY['https://images.unsplash.com/photo-1582126892906-5ba118eaf46e?w=800'],
    'verified',
    ARRAY['Hindu', 'Chola', 'Bronze', 'Temple Art'],
    '12th Century Style',
    'Tamil Nadu, India',
    true,
    true
),
(
    'Mughal Era Manuscript Page',
    'mughal-era-manuscript-page',
    'Authentic illuminated manuscript page from the Mughal period featuring Persian calligraphy with gold leaf borders. Includes detailed miniature painting depicting court scenes.',
    28000.00,
    5,
    (SELECT id FROM public.categories WHERE slug = 'manuscripts-books'),
    ARRAY['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800'],
    'verified',
    ARRAY['Mughal', 'Persian', 'Calligraphy', 'Miniature'],
    '17th Century',
    'Delhi, India',
    true,
    true
),
(
    'Ancient Mauryan Coin',
    'ancient-mauryan-coin',
    'Rare punch-marked silver coin from the Mauryan Empire. Features distinctive symbols including the sun, six-armed wheel, and elephant. Authenticated by numismatic experts.',
    15000.00,
    8,
    (SELECT id FROM public.categories WHERE slug = 'coins-currency'),
    ARRAY['https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800'],
    'verified',
    ARRAY['Mauryan', 'Silver', 'Ancient', 'Numismatic'],
    '3rd Century BCE',
    'Pataliputra, India',
    true,
    true
),
(
    'Rajasthani Pichwai Painting',
    'rajasthani-pichwai-painting',
    'Traditional Pichwai painting on cloth depicting Lord Krishna with gopis. Hand-painted using natural pigments and gold accents. Perfect for home temples or collectors.',
    35000.00,
    4,
    (SELECT id FROM public.categories WHERE slug = 'paintings-art'),
    ARRAY['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800'],
    'verified',
    ARRAY['Rajasthani', 'Pichwai', 'Krishna', 'Traditional'],
    'Contemporary (Traditional Style)',
    'Nathdwara, Rajasthan',
    true,
    true
),
(
    'Banarasi Silk Brocade',
    'banarasi-silk-brocade',
    'Vintage Banarasi silk fabric with intricate gold zari work. Features traditional motifs including paisley and floral patterns. Suitable for framing or special occasions.',
    18500.00,
    6,
    (SELECT id FROM public.categories WHERE slug = 'textiles-fabrics'),
    ARRAY['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800'],
    'verified',
    ARRAY['Banarasi', 'Silk', 'Zari', 'Handwoven'],
    'Mid 20th Century',
    'Varanasi, India',
    false,
    true
),
(
    'Temple Jewelry Set',
    'temple-jewelry-set',
    'Complete temple jewelry set including necklace, earrings, and maang tikka. Gold-plated brass with ruby and emerald stones. Inspired by traditional South Indian designs.',
    12500.00,
    10,
    (SELECT id FROM public.categories WHERE slug = 'jewelry-ornaments'),
    ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'],
    'verified',
    ARRAY['Temple Jewelry', 'South Indian', 'Traditional'],
    'Contemporary',
    'Chennai, India',
    true,
    true
),
(
    'Terracotta Horse - Bankura',
    'terracotta-horse-bankura',
    'Iconic Bankura horse in traditional terracotta. This folk art piece represents the craftsmanship of Bengal artisans. Each piece is unique with hand-painted decorative patterns.',
    8500.00,
    12,
    (SELECT id FROM public.categories WHERE slug = 'pottery-ceramics'),
    ARRAY['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'],
    'verified',
    ARRAY['Bankura', 'Terracotta', 'Folk Art', 'Bengal'],
    'Contemporary',
    'Bankura, West Bengal',
    false,
    true
),
(
    'Rajput Ceremonial Sword',
    'rajput-ceremonial-sword',
    'Ornate ceremonial sword with carved hilt and damascene blade. Features gold inlay work on the handle and traditional Rajputana design elements. Display piece with certificate.',
    65000.00,
    2,
    (SELECT id FROM public.categories WHERE slug = 'weapons-armor'),
    ARRAY['https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800'],
    'verified',
    ARRAY['Rajput', 'Sword', 'Ceremonial', 'Indian Weaponry'],
    '19th Century Style',
    'Udaipur, Rajasthan',
    true,
    true
),
(
    'Gandhara Buddha Head',
    'gandhara-buddha-head',
    'Replica of a Gandhara-style Buddha head showcasing the unique Greco-Buddhist artistic tradition. Made from composite stone with aged patina finish.',
    22000.00,
    5,
    (SELECT id FROM public.categories WHERE slug = 'statues-sculptures'),
    ARRAY['https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800'],
    'verified',
    ARRAY['Gandhara', 'Buddhist', 'Greco-Indian', 'Sculpture'],
    'Gandhara Period Style',
    'Northwest India',
    false,
    true
),
(
    'Madhubani Folk Painting',
    'madhubani-folk-painting',
    'Original Madhubani painting on handmade paper depicting the Tree of Life. Created by traditional Mithila artists using natural dyes. Includes certificate of authenticity.',
    9500.00,
    8,
    (SELECT id FROM public.categories WHERE slug = 'paintings-art'),
    ARRAY['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800'],
    'verified',
    ARRAY['Madhubani', 'Folk Art', 'Mithila', 'Bihar'],
    'Contemporary',
    'Madhubani, Bihar',
    false,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
