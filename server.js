const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 5000;

// Define the allowed origins
const allowedOrigins = ['http://localhost:3000', 'https://oliverharan.github.io'];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type'], // Allow only the Content-Type header
}));

// Middleware for parsing JSON request bodies and allowing larger payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Path to the data.json file
const dataPath = path.join(__dirname, 'data.json');

// Function to read JSON data from data.json
const readData = () => {
  try {
    const data = fs.readFileSync(dataPath);
    const parsedData = JSON.parse(data);
    return parsedData.lenses || []; // Return the lenses array or an empty array if not found
  } catch (error) {
    console.error('Error reading data file:', error);
    return [];
  }
};

// Function to write JSON data to data.json
const writeData = (lenses) => {
  try {
    const data = { lenses }; // Wrap lenses array inside an object
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to data file:', error);
  }
};

// Get all lenses
app.get('/lenses', (req, res) => {
  const lenses = readData();
  res.json(lenses);
});

// Get a single lens by ID
app.get('/lenses/:id', (req, res) => {
  const lenses = readData();
  const lens = lenses.find((lens) => lens.id === req.params.id);
  if (lens) {
    res.json(lens);
  } else {
    res.status(404).json({ message: 'Lens not found' });
  }
});

// Add a new lens
app.post('/lenses', (req, res) => {
  const lenses = readData();
  const newLens = req.body;
  newLens.id = Date.now().toString(); // Generate a simple ID
  lenses.push(newLens);
  writeData(lenses);
  res.status(201).json(newLens);
});

// Update a lens by ID
app.put('/lenses/:id', (req, res) => {
  const lenses = readData();
  const index = lenses.findIndex((lens) => lens.id === req.params.id);
  if (index !== -1) {
    lenses[index] = { ...lenses[index], ...req.body };
    writeData(lenses);
    res.json(lenses[index]);
  } else {
    res.status(404).json({ message: 'Lens not found' });
  }
});

// Delete a lens by ID
app.delete('/lenses/:id', (req, res) => {
  const lenses = readData();
  const updatedLenses = lenses.filter((lens) => lens.id !== req.params.id);
  if (updatedLenses.length !== lenses.length) {
    writeData(updatedLenses);
    res.json({ message: 'Lens deleted' });
  } else {
    res.status(404).json({ message: 'Lens not found' });
  }
});

// Welcome message for root path
app.get('/', (req, res) => {
  res.send('Welcome to the Lens API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
