const User = require('../model/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Router} = require('express');
const Routers = Router();
const cors = require('cors');
const cookieparser = require('cookie-parser');
Routers.use(cors({
    origin: "http://localhost:3000", 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  Routers.use(cookieparser());
Routers.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const x = await User.findOne({email:email});
        if(x){
          return  res.status(500).send({error:"Already exist"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });
        
        res.status(201).send({ message: 'User registered', userId: newUser._id });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error registering user' });
    }
});
const Secret = "Raghav";
Routers.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
       
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({email:email},Secret);
            res.cookie("token", token, {
                httpOnly: true,  
                secure: false,   
                sameSite: 'lax'  
            });
            res.send({ message: 'Login successful', userId: user._id , token:token});
        } else {
            res.status(401).send({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error logging in' });
    }
});
Routers.get('/auth', async (req,res)=>{
    if(req.user){
        return res.status(201).send();
    }
    const t = req.cookies?.token;

    if(!t){
        return res.status(500).send({error:"error"});
    }
    
    const x = jwt.verify(t,Secret,(err,user)=>{
        if(!user){
        console.log("error");
       return res.status(500).send({error:"error"});
        
        }
        else{
            req.user = user;
            console.log("ok");
            res.status(201).send({ok:"ok"})
        }
       
    });
    

        
    
    

})
Routers.post('/logout', async (req,res)=>{
  
    res.clearCookie("token", { 
        httpOnly: true, 
        secure: false, // Change to true in production (HTTPS)
        sameSite: "lax" // Change to "none" if frontend and backend are on different domains
    });

    res.status(200).json({ message: "Logout successful" });
})
module.exports = Routers;