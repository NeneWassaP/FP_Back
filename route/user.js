const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { user } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');

router.post("/register", async (req,res) => {
    const { username, password } = req.body;

    const exist = await user.findOne({
        where: {
            username: username
        }
    });

    if(exist){
        return res.status(400).json({ massage: "this username already exist!!!"});
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
        return res.status(400).json({ massage: "user is not exist"});
    }

    if(password != exist.password){
        return res.status(400).json({ massage: "password or username incorrect"});
    }

    const token = jwt.sign({ id: exist.id }, "konginwza", {expiresIn: "7d" });
    return res.json({ token: token });
});

router.patch("/password", tokenVerificationMiddleware, async(req, res) => {
    const { password } = req.body;

    await user.update({
        password: password
    }, {
        where: {
            id: req.user.id,
        }
    });
    
    return res.json({ massage: "change password success"});

});

module.exports = router;