-- Vytvoření nového datového typu
CREATE TYPE public.user_role AS ENUM(
    'Admin',
    'Klient',
    'Správce - level 1',
    'Správce - level 2',
    'Student'

);

-----------------------------------
-- TODO: Vytvoření tabulky Profiles
CREATE TABLE  public.Profiles (
    id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE
    PRIMARY KEY,

    name TEXT,
    email TEXT,
    phone TEXT,

    role public.user_role DEFAULT 'Student'::public.user_role NOT NULL, ---- Sloupec pro řízení přístupu s výchozí hodnotou Student
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone ('utc'::text, now()) NOT NULL

);
-----------------------------------------
--TODO: Povolení Row Level Security (RLS)
ALTER TABLE public.Profiles ENABLE ROW LEVEL SECURITY;