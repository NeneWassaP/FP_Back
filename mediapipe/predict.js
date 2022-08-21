const express = require('express');
const router = express.Router();
const {spawn} = require('child_process');
const multer  = require('multer');
const upload = multer({ dest: './collect' });
const fs = require('fs');
const path = require('path');
const { user,collect } = require('./../models');
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


router.post('/predict',upload.single('image'),async (req, res) => {
    
    await collect.create({
        user_id: 1,
        file_name: req.file.filename
    });

    const count = (await collect.findAll({
        attributes: ["file_name"],
        where:{
            user_id: 1
        },
        order: [
            ["id","desc"]
        ],
        limit: 4
    })).map(e => e.file_name)
    
    count.reverse();

    const response = await axios.post("http://localhost:3001/python", { file_name: req.file.filename, count });
    
    return res.json({ message : response.data });
})
 



module.exports = router;

