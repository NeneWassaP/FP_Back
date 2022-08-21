const express = require('express');
const router = express.Router();

const { user ,word, track, answer } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');
const { Op } = require('sequelize');

router.post("/question", tokenVerificationMiddleware, async (req,res) => {
    const { unit } = req.body;
    const check = await track.findOne({
        attributes: ["unit_id"],
        where: {
            user_id: req.user.id,
        },
    });
    
    if(unit>(check||{unit_id:1}).unit_id){
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

router.post("/answer",tokenVerificationMiddleware ,async (req,res) => {

    const { word_id , ans } = req.body;
    const selected_word = await word.findOne({
        attributes: ["unit_id","word"],
        where: {
            id: word_id,
        },
    });

    const is_correct = selected_word.word == ans;
    await answer.create({
        user_id: req.user.id,
        unit_id: selected_word.unit_id,
        word_id,
        is_correct,
    });

    res.json({ is_correct, correct: selected_word.word })
    
});

router.get("/all" ,async (req,res) => {
    
    const result = await user.findAll({
        attributes: ["id"],
        include: {
            model: answer,
            attributes: ["unit_id","word_id","is_correct"],
        },
        order: [
            ["id","asc"],
            [answer, "unit_id", "asc"],
        ],
    });

    res.json({ result })
    
});

module.exports = router;