const express = require('express');
const router = express.Router();
const {spawn} = require('child_process');
const multer  = require('multer');
const upload = multer({ dest: './collect' });
const fs = require('fs');
const path = require('path');
const { user, word , track ,collect } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');
const { Op } = require('sequelize');
const axios = require('axios');

if (!fs.existsSync("./collect")){
    fs.mkdirSync("./collect");
}

fs.readdir("./collect", (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      fs.unlink(path.join("./collect", file), err => {
        if (err) throw err;
      });
    }
});

if (!fs.existsSync("./landmark")){
  fs.mkdirSync("./landmark");
}

fs.readdir("./landmark", (err, files) => {
    if (err) throw err;

    for (const file of files) {
        fs.unlink(path.join("./landmark", file), err => {
            if (err) throw err;
        });
    }
});

collect.destroy({
    where: {
        id: {
            [Op.gt] : 0,
        },
    },
});

//const holistic = require('@mediapipe/holistic/holistic');
//console.log(holistic.Solution())

router.post("/question", tokenVerificationMiddleware, async (req,res) => {
    const { unit } = req.body;
    const check = await track.findOne({
        attributes: ["unit_id"],
        where: {
            user_id: req.user.id,
        },
    });
    
    if (!check && unit > 1) {
        return res.status(403).json({ message: "This unit isn't unlocked!!"});
    }
    if(unit>check.unit_id){
        return res.status(403).json({ message: "This unit isn't unlocked!!"});
    }

    const Qnum = [];
    let num;
    for(let i=0; i<3 ; i++){
        do{
            num = Math.floor(Math.random()*6)+(6*(unit-1))+1;
        }while(Qnum.includes(num))
        Qnum.push(num);       
    }
    
    let result = await word.findAll({
        attributes: ['id','word'],
        where: {
            id: {
                [Op.in]: Qnum
            }
        }
    });
    
    res.json({question: result})
});

router.post('/predict',[tokenVerificationMiddleware,upload.single('image')],async (req, res) => {
    
    const { word_id } = req.body;

    await collect.create({
        user_id: 1,
        file_name: req.file.filename
    });

    const count = (await collect.findAll({
        attributes: ["file_name"],
        where:{
            user_id: req.user.id,
        },
        order: [
            ["id","desc"]
        ],
        limit: 4
    })).map(e => e.file_name)
    
    count.reverse();
    let response;
    try{
        response = await axios.post("http://localhost:3001/python", { file_name: req.file.filename, count });
    }catch(err){
        console.log(err)
    }

    //return res.json({ message : response});

    const check = await word.findOne({
        attributes: ['word'],
        where:{
            id: word_id
        },
    });

    const is_correct = check.word == response.data;
    
    res.json({ is_correct: is_correct , word: response.data })

})
 

module.exports = router;

