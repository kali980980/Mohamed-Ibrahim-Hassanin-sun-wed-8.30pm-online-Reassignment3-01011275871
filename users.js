const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Helper: read users from the JSON file
function readUsers() {
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

// Helper: write users to the JSON file
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

/**
 * 1. Create an API that adds a new user to the users JSON file.
 *    Ensures the email doesn't already exist before adding.
 *    URL: POST /user
 */
router.post('/', (req, res) => {
  const { name, age, email } = req.body;

  if (!name || !age || !email) {
    return res.status(400).json({ message: 'name, age, and email are required.' });
  }

  const users = readUsers();

  const emailExists = users.some((u) => u.email === email);
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists.' });
  }

  const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const newUser = { id: newId, name, age, email };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: 'User added successfully.' });
});

/**
 * 2. Create an API that updates an existing user's name, age, or email by ID.
 *    URL: PATCH /user/:id
 *    Mentor note: if the update includes an email, validate that it doesn't
 *    already belong to a different user before applying the update.
 */
router.patch('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updates = req.body; // e.g. { age: 30 } or { email: "new@email.com" }

  const users = readUsers();
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User ID not found.' });
  }

  if (updates.email) {
    const emailTakenByAnotherUser = users.some(
      (u) => u.email === updates.email && u.id !== id
    );
    if (emailTakenByAnotherUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  writeUsers(users);

  res.json({ message: 'User age updated successfully.' });
});

/**
 * 3. Create an API that deletes a user by ID.
 *    URL: DELETE /user/:id
 */
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  const users = readUsers();
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User ID not found.' });
  }

  users.splice(userIndex, 1);
  writeUsers(users);

  res.json({ message: 'User deleted successfully.' });
});

/**
 * 4. Create an API that gets all users from the JSON file.
 *    URL: GET /user
 */
router.get('/', (req, res) => {
  const users = readUsers();
  res.json(users);
});

/**
 * 5. Create an API that gets a user by ID.
 *    URL: GET /user/:id
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const users = readUsers();
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json(user);
});

module.exports = router;
