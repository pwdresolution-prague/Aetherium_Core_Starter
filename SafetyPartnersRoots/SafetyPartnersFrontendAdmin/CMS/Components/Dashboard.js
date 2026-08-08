//TODO: Dashboard space || Analytics dashboard =========================
//TODO: ================================================================



//TODO: Aktuální návštěvnost
const currentAtendance = document.querySelector('.currentAttendanceValue')
currentAtendance.textContent = fetchedValue













//==================================================================================
//TODO: Počet Aktivních kurzů
const activeCourse = document.querySelector('.activeCoursesValue')
activeCourse.textContent = fetchedValue


















//=============================================================================================
//TODO: Obsahová databáze 
const contentDatabase = document.querySelector('.contentDatabaseValue')
contentDatabase.textContent = fetchedValue













//===============================================================================================
//TODO: Behaviorální biometrie
const biomteryValue = document.querySelector('.biomteryValue')
biomteryValue.textContent = fetchedValue













//TODO: Analyzační dashboard spodní část ==========================================
//TODO:=============================================================================
// Prvek vykreslení canvas + další konstanty 


//TODO: Biometrie křivky ==================================================================

//Zásadní část pro zobrazení grafu - udržení grafu v měřítku
//Uchopení Element id přes #
const canvas = document.querySelector('#progressGraph')
//Uchopí proměnnou canvas, naváže getContext do 2d a uloží do proměnné
const context = canvas.getContext('2d')
// ----- ('2d') je dvourozměrné ale pro 3D je ('webgl')

//=====================================================================

// Přizpůsobení objektu Rodičovskému elementu
const container = canvas.parentElement

// clientWidth a clientHeight jsou pravítka mého objektu
canvas.width = container.clientWidth
canvas.height = container.clientHeight
//============================================================================================

// Definice dat - Index Biometrie 
const dataPoints = [
    { x: 0,  y: 12 },
    { x: 1,  y: 18 },
    { x: 2,  y: 22 },
    { x: 4,  y: 35 },
    { x: 5,  y: 42 },
    { x: 6,  y: 55 },
    { x: 7,  y: 58 },
    { x: 8,  y: 63 },
    { x: 9,  y: 78 },
    { x: 10, y: 87 }
    
]
//====================================================================================================

// Layout grafu - okraje , osy , měřítka...
const padding = {
    left: 40,
    right: 15,
    top: 15,
    bottom: 30
}
// Proměnné napojené vykreslení html . šířka, výška + směry
const graphWidth = canvas.width - padding.left - padding.right
const graphHeight = canvas.height - padding.top - padding.bottom

const maxY = 100
const maxX = dataPoints.length - 1

//=================================================================================================

//Funkce převodu hodnot na pixely...
const getX = function(value){
    return padding.left + (value / maxX ) * graphWidth

}
const getY = function(value){
    return padding.top + graphHeight - (value / maxY ) * graphHeight
}

// =================================================================================================

// Mřížka  
context.strokeStyle = '' //Barva + Linie umí i gradientní přechod
context.lineWidth = 1 //Tlouštka linie
// Smyčka 
for(let i = 0; i <= 5; i++){
    const osaY = padding.top + (graphHeight / 5) * i
    context.beginPath() //Dávám fixu na papír
    context.moveTo(padding.left, osaY) //Konec linie
    context.lineTo(canvas.width - padding.right, osaY) //Začátek linie
    context.stroke() //Teď skutečně obtahuji zvolenou barvou

}
//======================================================================================================

// Osy
context.strokeStyle = ''  //Znovu barva linie
context.lineWidth = 1.5 //Tlouštka linie + float 

context.beginPath() //Znovu dávám fixu na papír
context.moveTo(padding.left, padding.top) //Znovu konec
context.lineTo(padding.left, padding.top + graphHeight) //Začátek linie
context.lineTo(padding.left + graphWidth, padding.top + graphHeight) // Začátek linie
context.stroke() //Znovu obtahuji zvolenou barvou 

//=========================================================================================================

// Popisky Osy Y
context.fillStyle = ''
context.font = ''

for(let i = 0; i <= 5; i++){
    const labelValue = (maxY / 5) * (5 - i)
    const osaY = padding.top + (graphHeight / 5) * i
    context.fillText(labelValue.toFixed(0), 5, osaY + 3)

}
//============================================================================================================

// Popisky Osy X
dataPoints.forEach(point => {
    const osaX = getX(point.x)
    context.fillText(point.x, osaX - 4, canvas.height - 10)
})

//===========================================================================================

// Křivka - složitější nebo plynulá
context.strokeStyle = ''
context.lineWidth = 2.5
context.beginPath() //Znu dávám fixu na papír...

dataPoints.forEach((point, index)=> {
    const osaX = getX(point.osaX)
    const osaY = getY(point.osaY)

    if(index === 0) {
        context.moveTo(osaX, osaY)

    }else {
        context.lineTo(osaX, osaY)

    }

})

//========================================================================================================

// Křivka stíny(Biometrické cítění)
dataPoints.forEach(point => {
    context.beginPath() //znovu pokládám fixu na plátno
    context.arc(getX(point.osaX), getY(point.osaY), 3, 0, Math.PI * 2)
    context.fillStyle = ''
    context.fill()
})

//=====================================================================================================

// Exponenciální interpolace růstu (Detaily)
const last = dataPoints[dataPoints.length - 1]
const lastX = getX(last.osaX)
const lastY = getY(last.osaY)

context.beginPath() // Znovu položím fixu na plátno
context.moveTo(lastX, lastY)
context.lineTo(lastX + 10, lastY - 6)
context.lineTo(lastX + 4, lastY + 8)
context.closePath()
context.fillStyle = ''
context.fill()
















































//TODO: Biometrie - Aktivní okno|| ukazatel
//TODO: ======================================================================================
