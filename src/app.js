const express = require('express');
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

let model;

// Configure multer with in-memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // Example limit: 10MB
});

// Load the TFLite model
async function loadModel() {
    try {
        model = await tf.loadLayersModel('https://storage.googleapis.com/rempahpedia-image-repository/model/model.json');
        console.log('Model loaded successfully.');
    } catch (error) {
        console.error('Error loading model:', error);
    }
  }

app.use(express.json({ limit: '20mb' }));

// Endpoint to process uploaded image
app.post('/upload_image', upload.single('image'), async (req, res) => {
    try {
        if (!model) {
            return res.status(500).json({ error: 'Model not loaded.' });
        }
    
        const imageBuffer = req.file.buffer;
        const fileSize = req.file.size;
    
        // Resize and preprocess the image using sharp and TensorFlow.js
        const resizedImage = await sharp(imageBuffer)
            .resize({ width: 224, height: 224 })
            .toFormat('raw')
            .toBuffer();

        const tensor = tf.node.decodeImage(resizedImage)
            .expandDims()
            .toFloat();
    
        // Perform prediction with the tensor
        const predictions = await model.predict(tensor).data();
    
        // Respond with a success message including file size
        res.status(200).json({ 
            message: 'Image processed successfully.',
            fileSize: fileSize, // Include file size in the response
            predictions: predictions // Include predictions if needed
        });
    
        // Optionally, delete the file from memory after processing
        deleteUploadedFile(req.file);
  
    } catch (error) {
      // Handle errors
      console.error('Error processing image:', error);
      res.status(500).json({ error: error.message });
    }
});
  
// Function to delete uploaded file from memory
function deleteUploadedFile(file) {
    if (file && file.buffer) {
        file.buffer = null;
    }
}

loadModel().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
