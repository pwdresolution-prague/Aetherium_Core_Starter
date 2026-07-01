<!--TODO: Technická dokumentace: Inicializace a konektivita Supabase -->
<p>

1. Účel modulu
Tento modul představuje vstupní bránu do backendové infrastruktury Aetherium-Core. Slouží k inicializaci globálního klienta Supabase, který umožňuje frontendové aplikaci komunikovat s PostgreSQL databází bez nutnosti psát vlastní API
.
2. Správa prostředí (Environment Configuration)
Pro připojení jsou využívány dvě základní proměnné uložené v souboru .env. V rámci architektury Vite musí mít tyto proměnné povinný prefix VITE_, aby byly zahrnuty do klientského balíčku a dostupné v prohlížeči
: *