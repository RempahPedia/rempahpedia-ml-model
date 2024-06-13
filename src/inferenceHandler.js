const tf = require('@tensorflow/tfjs-node'); 
const modelClass = require('./modelData');

async function predict(req, res, model) {
    try {
        if (!model) {
            return res.status(500).json({ error: 'Model not loaded.' });
        }
    
        const imageBuffer = req.file.buffer;
        const fileSize = req.file.size;
    
        // Resize and preprocess the image
        const tensor = tf.node
            .decodeImage(imageBuffer)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat();

        // Perform prediction with the tensor
        const predictions = await model.predict(tensor).data();
        const { rempahName, score } = determineResult(predictions);
    
        // Respond with a success message including file size and predictions
        res.status(200).json({ 
            result: rempahName, 
            score: score 
        });
    
        // Optionally, delete the file from memory after processing
        deleteUploadedFile(req.file);
  
    } catch (error) {
        // Handle errors
        console.error('Error processing image:', error);
        res.status(500).json({ error: error.message });
    }
}

function deleteUploadedFile(file) {
    if (file && file.buffer) {
        file.buffer = null;
    }
}

function determineResult(predictions){
    let maxKey = null;
    let maxValue = -Infinity;
    
    for (const [key, value] of Object.entries(predictions)) {
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    }

    return {
        rempahName: modelClass[maxKey],
        score: maxValue
    };
}

module.exports = { predict };
