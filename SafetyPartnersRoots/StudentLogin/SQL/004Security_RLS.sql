CREATE policy "allow read profiles"
ON profiles
FOR select
USING (True);

ALTER TABLE profiles enable row level security