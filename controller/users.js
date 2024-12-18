const User = require('../model/users');
const bcrypt = require('bcryptjs');
const {Router} = require('express');
const Routers = Router();
Routers.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });
        res.status(201).send({ message: 'User registered', userId: newUser._id });
    } catch (error) {
        res.status(500).send({ error: 'Error registering user' });
    }
});
Routers.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            res.send({ message: 'Login successful', userId: user._id });
        } else {
            res.status(401).send({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error logging in' });
    }
});
module.exports = Routers;