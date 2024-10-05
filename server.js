const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Path to the data.json file
const dataPath = path.join(__dirname, 'data.json');

// Read JSON data
const readData = () => {
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
};

// Write JSON data
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
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

// Update a lens
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

// Delete a lens
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
