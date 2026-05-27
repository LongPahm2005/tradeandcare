
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('cho_xac_nhan', 'dang_xu_ly', 'hoan_thanh', 'da_huy');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profile policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile + role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, COALESCE(NEW.raw_user_meta_data->>'phone', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'cho_xac_nhan',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Order details
CREATE TABLE public.order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_details TO authenticated;
GRANT ALL ON public.order_details TO service_role;
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own order details" ON public.order_details FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Insert own order details" ON public.order_details FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admin manage order details" ON public.order_details FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Plant care
CREATE TABLE public.plant_care_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name TEXT NOT NULL,
  plant_type TEXT,
  watering TEXT,
  sunlight TEXT,
  soil TEXT,
  fertilizer TEXT,
  note TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plant_care_guides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.plant_care_guides TO authenticated;
GRANT ALL ON public.plant_care_guides TO service_role;
ALTER TABLE public.plant_care_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read care" ON public.plant_care_guides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage care" ON public.plant_care_guides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Diseases
CREATE TABLE public.plant_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  cause TEXT,
  solution TEXT,
  suggested_product_type TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plant_diseases TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.plant_diseases TO authenticated;
GRANT ALL ON public.plant_diseases TO service_role;
ALTER TABLE public.plant_diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read diseases" ON public.plant_diseases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage diseases" ON public.plant_diseases FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Chatbot
CREATE TABLE public.chatbot_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  question_sample TEXT,
  response TEXT NOT NULL,
  suggested_product_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chatbot_responses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chatbot_responses TO authenticated;
GRANT ALL ON public.chatbot_responses TO service_role;
ALTER TABLE public.chatbot_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chatbot" ON public.chatbot_responses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage chatbot" ON public.chatbot_responses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed
INSERT INTO public.categories (name, description) VALUES
  ('Cây cảnh', 'Các loại cây cảnh trang trí'),
  ('Cây ăn quả', 'Cây ăn trái các loại'),
  ('Phân bón', 'Phân bón hữu cơ và vô cơ'),
  ('Đất trồng', 'Đất sạch và giá thể trồng cây'),
  ('Chậu cây', 'Chậu trồng cây các loại'),
  ('Dụng cụ chăm sóc cây', 'Dụng cụ làm vườn');

INSERT INTO public.products (category_id, name, description, price, stock_quantity, image_url)
SELECT id, 'Cây ' || name || ' mẫu', 'Sản phẩm mẫu cho danh mục ' || name, 150000, 20, 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'
FROM public.categories;

INSERT INTO public.products (category_id, name, description, price, stock_quantity, image_url) VALUES
  ((SELECT id FROM public.categories WHERE name='Cây cảnh'), 'Cây Lưỡi Hổ', 'Cây lưỡi hổ thanh lọc không khí, dễ chăm sóc', 180000, 30, 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=600'),
  ((SELECT id FROM public.categories WHERE name='Cây cảnh'), 'Cây Kim Tiền', 'Cây kim tiền hợp phong thủy, mang tài lộc', 250000, 25, 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=600'),
  ((SELECT id FROM public.categories WHERE name='Cây cảnh'), 'Cây Trầu Bà', 'Cây trầu bà leo, dễ trồng', 120000, 40, 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=600'),
  ((SELECT id FROM public.categories WHERE name='Cây ăn quả'), 'Cây Chanh Tứ Quý', 'Cây chanh ra quả quanh năm', 320000, 15, 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600'),
  ((SELECT id FROM public.categories WHERE name='Cây ăn quả'), 'Cây Ổi Lê', 'Ổi lê Đài Loan giống tốt', 280000, 20, 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600'),
  ((SELECT id FROM public.categories WHERE name='Cây ăn quả'), 'Cây Xoài Cát Hòa Lộc', 'Xoài cát giống chuẩn miền Tây', 350000, 10, 'https://images.unsplash.com/photo-1605027990121-cbae9e0642db?w=600'),
  ((SELECT id FROM public.categories WHERE name='Phân bón'), 'Phân hữu cơ Trùn Quế 5kg', 'Phân hữu cơ sạch cho mọi loại cây', 95000, 50, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'),
  ((SELECT id FROM public.categories WHERE name='Phân bón'), 'Phân NPK 16-16-8', 'Phân NPK cân đối, kích cây phát triển', 65000, 80, 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600'),
  ((SELECT id FROM public.categories WHERE name='Đất trồng'), 'Đất sạch Tribat 20dm3', 'Đất sạch dinh dưỡng cao', 75000, 60, 'https://images.unsplash.com/photo-1581281863883-2469417a1668?w=600'),
  ((SELECT id FROM public.categories WHERE name='Chậu cây'), 'Chậu sứ trắng tròn 25cm', 'Chậu sứ trang trí hiện đại', 145000, 35, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'),
  ((SELECT id FROM public.categories WHERE name='Dụng cụ chăm sóc cây'), 'Bộ dụng cụ làm vườn 5 món', 'Đầy đủ kéo, xẻng, găng tay', 199000, 25, 'https://images.unsplash.com/photo-1599598425947-5325edc4a6e2?w=600');

INSERT INTO public.plant_care_guides (plant_name, plant_type, watering, sunlight, soil, fertilizer, note, image_url) VALUES
  ('Cây Lưỡi Hổ', 'Cây cảnh', 'Tưới 1 lần/tuần, tránh úng nước', 'Ưa sáng nhẹ, chịu bóng tốt', 'Đất tơi xốp, thoát nước tốt', 'Bón NPK loãng 2 tháng/lần', 'Tránh tưới quá nhiều gây thối rễ', 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=600'),
  ('Cây Kim Tiền', 'Cây cảnh', 'Tưới khi đất khô bề mặt', 'Ánh sáng gián tiếp', 'Đất pha cát, tơi xốp', 'Bón phân hữu cơ 1 tháng/lần', 'Cây dễ bị úng, kiểm soát lượng nước', 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=600'),
  ('Cây Chanh Tứ Quý', 'Cây ăn quả', 'Tưới 2 lần/ngày vào mùa khô', 'Nắng trực tiếp 6-8h/ngày', 'Đất thịt pha cát, giàu dinh dưỡng', 'Bón NPK + hữu cơ định kỳ', 'Cắt tỉa cành sau mỗi đợt quả', 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600'),
  ('Cây Ổi Lê', 'Cây ăn quả', 'Tưới đều, giữ ẩm đất', 'Nắng đầy đủ', 'Đất tơi xốp, pH 5.5-7', 'Bón phân chuồng + NPK', 'Bao trái khi quả non để tránh sâu', 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600'),
  ('Cây Trầu Bà', 'Cây cảnh', 'Tưới 2-3 lần/tuần', 'Bóng râm, ánh sáng yếu', 'Đất hữu cơ tơi xốp', 'Phân bón lá định kỳ', 'Lau lá sạch để cây quang hợp tốt', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=600');

INSERT INTO public.plant_diseases (symptom, disease_name, cause, solution, suggested_product_type) VALUES
  ('Lá vàng', 'Thiếu dinh dưỡng / thừa nước', 'Đất nghèo dinh dưỡng hoặc tưới quá nhiều nước', 'Bón phân NPK cân đối, giảm lượng nước tưới, kiểm tra thoát nước', 'Phân bón'),
  ('Héo lá', 'Thiếu nước hoặc thối rễ', 'Cây thiếu nước hoặc bộ rễ bị tổn thương', 'Tưới đủ nước, kiểm tra rễ, thay đất nếu cần', 'Đất trồng'),
  ('Thối rễ', 'Úng nước, nấm bệnh', 'Thoát nước kém, tưới quá nhiều', 'Thay đất tơi xốp, cắt rễ thối, dùng thuốc trị nấm', 'Đất trồng'),
  ('Đốm nâu trên lá', 'Bệnh nấm lá', 'Độ ẩm cao, vi nấm tấn công', 'Cắt bỏ lá bệnh, phun thuốc trừ nấm sinh học', 'Dụng cụ chăm sóc cây'),
  ('Rụng lá', 'Sốc nhiệt / thiếu sáng', 'Thay đổi môi trường đột ngột', 'Đặt cây nơi ổn định, bổ sung ánh sáng', 'Cây cảnh'),
  ('Sâu ăn lá', 'Sâu bọ tấn công', 'Sâu ăn lá, rệp', 'Bắt sâu bằng tay, phun thuốc sinh học neem oil', 'Dụng cụ chăm sóc cây');

INSERT INTO public.chatbot_responses (keyword, question_sample, response, suggested_product_type) VALUES
  ('vàng lá', 'Cây bị vàng lá thì làm sao?', 'Lá vàng thường do thừa nước hoặc thiếu dinh dưỡng. Bạn nên giảm tưới nước và bón thêm phân NPK cân đối. Kiểm tra hệ thống thoát nước của chậu.', 'Phân bón'),
  ('thối rễ', 'Cây bị thối rễ phải làm gì?', 'Thối rễ do úng nước. Nhổ cây, cắt bỏ rễ thối, thay đất tơi xốp mới và giảm tưới nước.', 'Đất trồng'),
  ('sâu', 'Cây bị sâu ăn lá', 'Bạn có thể bắt sâu bằng tay hoặc dùng dung dịch neem oil phun lên lá. Tránh thuốc hóa học mạnh với cây trong nhà.', 'Dụng cụ chăm sóc cây'),
  ('héo', 'Cây bị héo lá', 'Cây héo có thể do thiếu nước hoặc thối rễ. Hãy kiểm tra độ ẩm đất và tình trạng rễ.', 'Đất trồng'),
  ('tưới', 'Tưới cây bao nhiêu là đủ?', 'Phần lớn cây cảnh chỉ cần tưới khi mặt đất khô. Trung bình 2-3 lần/tuần với cây trong nhà, 1-2 lần/ngày với cây ngoài trời mùa khô.', 'Cây cảnh'),
  ('phân bón', 'Khi nào nên bón phân?', 'Bón phân định kỳ 1-2 tháng/lần. Sử dụng phân hữu cơ kết hợp NPK để cây phát triển khỏe mạnh.', 'Phân bón'),
  ('ánh sáng', 'Cây cần bao nhiêu ánh sáng?', 'Cây cảnh trong nhà cần ánh sáng gián tiếp. Cây ăn quả cần nắng trực tiếp 6-8 giờ/ngày.', 'Cây cảnh'),
  ('đốm nâu', 'Lá có đốm nâu', 'Đốm nâu là dấu hiệu nấm lá. Cắt bỏ lá bệnh và phun thuốc trừ nấm sinh học.', 'Dụng cụ chăm sóc cây');
