import { getRegistration, getImport } from './AetheriumClientStore.js'
import { calculateOrder } from './PricingRules.js'

const toInt = (v) => Number.parseInt(v, 10) || 0

export function analyzeUsage(students, invalid, duplicates, expectedCourses) {
    const warnings = []
    const totalRows = students + invalid + duplicates
    const invalidShare = totalRows ? invalid / totalRows : 0

    if (!expectedCourses) warnings.push('Není zadán předpokládaný počet školení.')
    if (invalidShare > 0.2) warnings.push('Více než 20 % řádků importu je chybných.')

    return {
        students,
        expectedCourses,
        coursesPerStudent: expectedCourses && students ? expectedCourses / students : null,
        invalidShare,
        warnings,
    }
}

// Jediné místo, které spojí firmu + import + porovnání + cenu. Shrnutí i platba čtou odsud.
export function buildCheckoutSnapshot() {
    const company = getRegistration()
    if (!company) return { ok: false, reason: 'NO_REGISTRATION' }

    const imp = getImport()
    const students = imp?.valid?.length ?? 0
    if (!imp || students === 0) return { ok: false, reason: 'NO_STUDENTS', company }

    const expectedCourses = toInt(company.expectedCourses)
    const usage = analyzeUsage(students, imp.invalid?.length ?? 0, imp.duplicates ?? 0, expectedCourses)
    const order = calculateOrder(company, students)   // sem později přibude usage (ceník)

    return {
        ok: true,
        company,
        import: { fileName: imp.fileName, students, invalid: imp.invalid?.length ?? 0, duplicates: imp.duplicates ?? 0 },
        usage,
        order,
    }
}
