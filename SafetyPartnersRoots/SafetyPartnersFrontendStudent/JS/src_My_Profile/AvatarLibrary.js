import { createAvatar } from '@dicebear/core'
import { lorelei } from '@dicebear/collection'

//FRONTEND: Pevné seedy = stálá nabídka 12 avatarů, nenáhodné, pokaždé jinak
// 
const AVATAR_SEEDS = [
    'Aetherium_Avatar_01', 'Aetherium_Avatar_02', 'Aetherium_Avatar_03',
    'Aetherium_Avatar_04', 'Aetherium_Avatar_05', 'Aetherium_Avatar_06',
    'Aetherium_Avatar_07', 'Aetherium_Avatar_08', 'Aetherium_Avatar_09',
    'Aetherium_Avatar_10', 'Aetherium_Avatar_11', 'Aetherium_Avatar_12',

]

export function generateAvatarPresets() {
    return AVATAR_SEEDS .map(seed => ({
        seed,
        svg: createAvatar(lorelei, { seed, size: 64}).toString()
    }))
    
}