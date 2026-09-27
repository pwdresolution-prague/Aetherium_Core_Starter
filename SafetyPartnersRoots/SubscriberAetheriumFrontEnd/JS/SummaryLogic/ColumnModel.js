import * as tf from '@tensorflow/tfjs'
import { CLASSES, FEATURE_COUNT, extractFeatures } from './ColumnFeatures.js'

const MODEL_URL = '/models/column-classifier/model.json' //složka public
let modelPromise = null
const loadModel = () => (modelPromise ??= tf.loadLayersModel(MODEL_URL))

//COMMENT: columns = pole sloupců, každý sloupec  = pole hodnot - pole pravděpodobnosti [firstName, lastName, ....]

export async function predictColumns(columns) {
    const model = await loadModel()
    const input = tf.tensor2d(columns.map(extractFeatures))
    const out = model.predict(input)
    const probs = await out.array()
    tf.dispose([input, out])
    return probs
}


export async function trainAndDownload(samples) {
    const xs = tf.tensor2d(samples.map((s) => s.features))
    const ys = tf.oneHot(
        tf.tensor1d(samples.map((s) => CLASSES.indexOf(s.label)), 'int32'),
        CLASSES.length
    )

    const model = tf.sequential({
        layers: [
            tf.layers.dense({ inputShape: [FEATURE_COUNT], units: 16, activation: 'relu' }),
            tf.layers.dense({ units: 8, activation: 'relu' }),
            tf.layers.dense({ units: CLASSES.length, activation: 'softmax' }),
        ],
    })
    model.compile({ optimizer: tf.train.adam(0.01), loss: 'categoricalCrossentropy', metrics: ['accuracy'] })
    await model.fit(xs, ys, { epochs: 60, shuffle: true, validationSplit: 0.2 })

    await model.save('downloads://model') // stáhne model.json + model.weights.bin
}
