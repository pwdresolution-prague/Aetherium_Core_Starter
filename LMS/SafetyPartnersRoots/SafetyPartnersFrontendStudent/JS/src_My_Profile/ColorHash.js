//FRONTEND: hashStringToHue - sdílená funkce pro konzistentní per-use barvy
//COMMENT: Použito v event-log.js v Admin sekci profil avatar
// 
export function hashStringToHue(str) {
    let hash = 0 
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % 360 //COMMENT: Vrací Hue 0 - 359
}