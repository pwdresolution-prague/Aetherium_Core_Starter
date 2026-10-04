//COMMENT: FRONTEND: Vytvoření eskalujícího upozornění na systémovou událost
// 
const diodeBalance = [ 
    document.getElementById('diodeBalance1'),
    document.getElementById('diodeBalance2'),
    document.getElementById('diodeBalance3'),


]

const raw_progressBalance = document.getElementById('raw_progressBalance')

//COMMENT: Aplikace stavu  - kumulativní rozsvícení dle levelu
// 
function applyBalanceLevel(level) {
    diodeBalance.forEach((diode, index) => {
        const isOn = index < level
        diode.classList.toggle('on', isOn)
        diode.classList.toggle('off', !isOn)
    })
    raw_progressBalance.value = level
}

//COMMENT: Vyhodnocení levelu podle počtu rozestudovaných kurzů
function eveluateBalanceLevel(unfinishedCoursesCount) {
    if (unfinishedCoursesCount === 0) return 0
    if (unfinishedCoursesCount <= 2) return 1
    if (unfinishedCoursesCount <= 4) return 2
    return 3 
}

const unfinishedCourses = 5
const level = eveluateBalanceLevel(unfinishedCourses)

applyBalanceLevel(level)
