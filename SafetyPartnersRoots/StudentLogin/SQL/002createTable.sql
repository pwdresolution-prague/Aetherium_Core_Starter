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