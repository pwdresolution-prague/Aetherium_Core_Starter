import { Style, Avatar } from '@dicebear/core'
import loreleiDefinition from '@dicebear/styles/lorelei.json'

const loreleiStyle = new Style(loreleiDefinition)

const AVATAR_SEEDS = [
    'Aetherium_Avatar_01', 'Aetherium_Avatar_02', 'Aetherium_Avatar_03',
    'Aetherium_Avatar_04', 'Aetherium_Avatar_05', 'Aetherium_Avatar_06',
    'Aetherium_Avatar_07', 'Aetherium_Avatar_08', 'Aetherium_Avatar_09',
    'Aetherium_Avatar_10', 'Aetherium_Avatar_11', 'Aetherium_Avatar_12',
]

export function generateAvatarPresets() {
    return AVATAR_SEEDS.map((seed) => ({
        seed,
        svg: new Avatar(loreleiStyle, { seed, size: 64 }).toString(),
    }))
}
