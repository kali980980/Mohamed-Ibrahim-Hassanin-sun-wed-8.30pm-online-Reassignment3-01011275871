const express = require('express');

const streamRoutes = require('./routes/streams');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Part 1: Core Modules (streams) -> /stream/...
app.use('/stream', streamRoutes);

// Part 2: Simple CRUD Operations -> /user/...
app.use('/user', userRoutes);

// Simple root route to confirm the API is running
app.get('/', (req, res) => {
  res.json({
    message: 'Assignment 3 API is running.',
    endpoints: {
      part1_streams: {
        'GET /stream/read-chunks': 'Reads ./data/big.txt in chunks and logs each chunk',
        'GET /stream/copy': 'Copies ./data/source.txt to ./data/dest.txt using streams',
        'GET /stream/compress': 'Compresses ./data/data.txt into ./data/data.txt.gz via pipeline'
      },
      part2_crud: {
        'POST /user': 'Add a new user { name, age, email }',
        'PATCH /user/:id': 'Update a user by ID',
        'DELETE /user/:id': 'Delete a user by ID',
        'GET /user': 'Get all users',
        'GET /user/:id': 'Get a user by ID'
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`Assignment 3 API listening on http://localhost:${PORT}`);
});
