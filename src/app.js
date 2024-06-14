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
    const {rempahName, score} = await predict(req, res, model);

    const idToken = req.cookies.access_token;

    const payload = { rempah: rempahName };

    // make an API calls to another service to send the result of prediction
    if (idToken) {
      const backendResponse = await axios.post('https://rempahpedia-6qjjxs4fia-et.a.run.app/api/prediciton/save', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `access_token=${idToken}`
        },
        withCredentials: true // Allow sending cookies
      });

      console.log('Response from backend service:', backendResponse.data);

    } else {
      console.log('No access token found');
    }
    
    res.status(200).json({ 
      result: rempahName, 
      score: score 
    });
});

app.get("/reload_model", async (req, res) =>{loadModel()})

loadModel().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
