const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    try {
        model = await tf.loadGraphModel(process.env.MODEL_URL);
        console.log('Model loaded successfully.');
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

module.exports = {loadModel};