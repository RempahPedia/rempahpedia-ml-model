const express = require('express');
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');

const { predict } = require('./inferenceHandler');

const app = express();
const PORT = process.env.PORT || 3001;

let model;

async function loadModel() {
  try {
      model = await tf.loadGraphModel(process.env.MODEL_URL);
      console.log('Model loaded successfully.');
  } catch (error) {
      console.error('Error loading model:', error);
  }
}

// Configure multer with in-memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
});

app.use(express.json({ limit: '20mb' }));

app.post('/predict', upload.single('image'), async (req, res) => {
    predict(req, res, model);
});

app.get("/reload_model", async (req, res) =>{loadModel()})

loadModel().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
