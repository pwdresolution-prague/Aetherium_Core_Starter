//FRONTEND: Kruh avatara  + výběr z 12 DiceBear + fallback iniciály
// 
import { hashStringToHue } from '../src_My_Profile/ColorHash.js'
import  { generateAvatarPresets } from '../src_My_Profile/AvatarLibrary.js'

const avatarContainer = document.getElementById('profilAvatarId')
const avatarInitialsEl = document.getElementById('profileAvatarInitialsId')
const openAvatarPicker = document.getElementById('openAvatarPickerId')
const avatarPickerModal = document.getElementById('avatarPickerModal')
const avatarGrid = document.getElementById('avatarGridId')
const cancelAvatarPicker = document.getElementById('cancelAvatarPickerId')

//TODO: Mock uživatel - Později nahrtaji reálnou hodnotu z supabase

const currentUserName = 'Jan Novák'
let selectedAvatarSeed = null //COMMENT: Zde se používají iniciály


//FRONTEND: Generování inicíiálů ze jména (maximálně 2 znaky)
// 
function getInitials(fullName) {
    return fullName
        .trim()
        .split(/\s+/)
        .map(part => part[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('')
}




//TODO: Vykresluje aktuální stav kruhu (iniciály nebo DiceBeat SVG)

function renderAvatarCircle() {
    const hue = hashStringToHue(currentUserName)
    avatarContainer.style.setProperty('--avatar-hue', hue)

    if (selectedAvatarSeed) {
        const preset = generateAvatarPresets().find(p => p.seed === selectedAvatarSeed)
        avatarContainer.classList.add('hasDicebearAvatar')
        avatarInitialsEl.innerHTML = preset.svg //COMMENT: SVG z důvěryhodné knihovny, ne uživatelský vstup   }

    } else {
        avatarContainer.classList.remove('hasDicebearAvatar')
        avatarInitialsEl.textContent = getInitials(currentUserName) //COMMENT: textContent = bezpečné proti XSS

    }

}

//FRONTEND: Naplnění Gridu v dialogu - 12 DiceBear + 1 volba "zpět na iniciály"
function renderAvatarGrid() {
    avatarGrid.innerHTML = ''


//COMMENT: Volba iniciálů jako první vždy dostupná
const initialsOption = document.createElement('button')
initialsOption.type = 'button'
initialsOption.className = 'avatarOption avatarOptionInitials'
initialsOption.style.setProperty('--avatar-hue', hashStringToHue(currentUserName))
initialsOption.textContent = getInitials(currentUserName)
initialsOption.addEventListener('click', () => selectAvatar(null))
avatarGrid.appendChild(initialsOption)

//COMMENT: 12 DiceBear variant

generateAvatarPresets().forEach(({ seed, svg}) => {
    const option = document.createElement('button')
    option.type = 'button'
    option.className = 'avatarOption'
    option.innerHTML = svg //COMMENT: SVG z lokální knohovny
    option.addEventListener('click', () => selectAvatar(seed))
    avatarGrid.appendChild(option)


})

}



//FRONTEND: Zpracování váýběru - ukládání volby a zavření dialogu

function selectAvatar(seed) {
    selectedAvatarSeed = seed
    renderAvatarCircle()
    avatarPickerModal.close()

//FRONTEND: TODO: Sem napojit uložení volby do SUPABASE: (stačí uložit seed )
//SUPABASE: await supabase.from('profiles').update({ avatar_seed: seed }).eq('id', userId);


}


//FRONTEND: Otevření dialogu
openAvatarPicker.addEventListener('click', () => {
    renderAvatarGrid()
    avatarPickerModal.showModal()
})

//FRONTEND: Zrušení bez výběru
cancelAvatarPicker.addEventListener('click', () => {
    avatarPickerModal.close()
})

//COMMENT: Inicializace při načtení stránky
renderAvatarCircle()


















