const express = require('express');
const router = express.Router();

const { word } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');
const { Op } = require('sequelize');

router.post("/question", tokenVerificationMiddleware, async (req,res) => {
    const { unit } = req.body;
    const Qnum = [];
    let num;
    for(let i=0; i<3 ; i++){
        do{
            num = Math.floor(Math.random()*6)+(6*(unit-1))+1;
        }while(Qnum.includes(num))
        Qnum.push(num);       
    }
    
    let result = await word.findAll({
        where: {
            id: {
                [Op.in]: Qnum
            }
        }
    });

    result = result.map(element => {
        return {
            id: element.id,
            choice: [element.word, element.A1, element.A2, element.A3].sort(() => Math.random() - 0.5),
        };
    })
    
    res.json({question: result})
});

module.exports = router;