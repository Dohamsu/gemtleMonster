-- Function to safe-guard profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    BEGIN
        INSERT INTO public.profiles (id, nickname)
        VALUES (new.id, generate_random_nickname())
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Error handling: If profile creation fails, we allow the user creation to succeed
        -- but verify the error in logs.
        RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    END;
    RETURN new;
END;
$$;
