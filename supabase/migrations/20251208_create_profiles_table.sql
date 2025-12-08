-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Function to generate random nickname
CREATE OR REPLACE FUNCTION generate_random_nickname()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    prefix TEXT[];
    animal TEXT[];
    random_prefix TEXT;
    random_animal TEXT;
    new_nickname TEXT;
    is_exists BOOLEAN;
    retry_count INTEGER := 0;
BEGIN
    -- 30 prefixes
    prefix := ARRAY[
        '용감한', '날쌘', '똑똑한', '배고픈', '졸린', 
        '행복한', '슬픈', '화난', '신난', '우울한', 
        '심심한', '바쁜', '게으른', '친절한', '무서운', 
        '귀여운', '멋진', '이상한', '평범한', '조용한', 
        '시끄러운', '깨끗한', '더러운', '맑은', '흐린', 
        '붉은', '푸른', '검은', '하얀', '황금'
    ];

    -- 30 animals
    animal := ARRAY[
        '호랑이', '사자', '토끼', '다람쥐', '고양이', 
        '강아지', '곰', '늑대', '여우', '판다', 
        '코끼리', '기린', '원숭이', '앵무새', '독수리', 
        '상어', '고래', '돌고래', '거북이', '펭귄', 
        '물개', '수달', '햄스터', '고슴도치', '족제비', 
        '너구리', '사슴', '얼룩말', '하마', '악어'
    ];

    LOOP
        -- Generate random combination
        random_prefix := prefix[floor(random() * 30) + 1];
        random_animal := animal[floor(random() * 30) + 1];
        new_nickname := random_prefix || ' ' || random_animal;

        -- Check existence
        IF retry_count > 0 THEN
            new_nickname := new_nickname || retry_count;
        END IF;

        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE nickname = new_nickname) INTO is_exists;

        IF NOT is_exists THEN
            RETURN new_nickname;
        END IF;

        retry_count := retry_count + 1;
        -- Safety break
        IF retry_count > 100 THEN
            RETURN '알수없는 모험가 ' || floor(random() * 10000);
        END IF;
    END LOOP;
END;
$$;

-- Trigger to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, nickname)
    VALUES (new.id, generate_random_nickname())
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

-- Drop trigger if exists to avoid duplication error on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill for existing users
-- Note: Requires running this block with appropriate permissions (often manual in Supabase dashboard)
-- But we can try to run it here for local dev if we are superuser.
DO $$
DECLARE
    u record;
BEGIN
    FOR u IN SELECT id FROM auth.users LOOP
        INSERT INTO public.profiles (id, nickname)
        VALUES (u.id, generate_random_nickname())
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END
$$;
