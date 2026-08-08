// StrongPassword.js
import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

// COMMENT: Vytvoření instance s konfigurací (slovníky, klávesnicové grafy, překlady)
const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
    },
}

const zxcvbnInstance = new ZxcvbnFactory(options)

// COMMENT: export -- jinak je funkce viditelná JEN uvnitř tohoto souboru
export function checkPasswordStrength(password) {
    const result = zxcvbnInstance.check(password)
    return {
        score: result.score,
        crackTime: result.crackTimes.offlineSlowHashing1e4PerSecond,
        feedback: result.feedback?.warning ?? ''
    }
}

