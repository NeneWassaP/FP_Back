const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { user } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');

router.post("/register", async (req,res) => {
    const { username, password, confirm_password } = req.body;

    const exist = await user.findOne({
        where: {
            username: username
        }
    });

    if(exist){
        return res.status(400).json({ message: "this username already exist!!!"});
    }

    if(password != confirm_password){
        return res.status(400).json({ message: "password is not the same!!!"});
    }

    const newUser = await user.create({
        username,
        password
    });

    return res.json({ user: newUser });
});


router.post("/login",async(req, res) => {
    const { username, password } = req.body;

    const exist = await user.findOne({
        where: {
            username: username
        }
    });

    if(!exist){
        return res.status(400).json({ message: "user is not exist"});
    }

    if(password != exist.password){
        return res.status(400).json({ message: "password or username incorrect"});
    }

    const token = jwt.sign({ id: exist.id }, "konginwza", {expiresIn: "7d" });
    return res.json({ token: token });
});

router.patch("/password", tokenVerificationMiddleware, async(req, res) => {
    const { Npassword , confirm_Npassword } = req.body;

    if(Npassword != confirm_Npassword){
        return res.status(400).json({ message: "New password is not the same!!!"});
    }

    await user.update({
        password: Npassword
    }, {
        where: {
            id: req.user.id,
        }
    });
    
    return res.json({ massage: "change password success"});

});

module.exports = router;