export const normalize = (s) =>
    String(s).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
