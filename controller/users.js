const User = require('../model/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Router } = require('express');
const Routers = Router();
const cookieparser = require('cookie-parser');
Routers.use(cookieparser());





Routers.post('/create-user', async (req, res) => {
  try {
    const { name, gender, age, interests } = req.body;

    const newUser = await User.create({
      name,
      gender,
      age,
      interests
    });

    res.status(201).json({ message: 'User created', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});















module.exports = Routers;