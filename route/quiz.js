const express = require('express');
const router = express.Router();

const { user ,word, track, quiz } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');
const { Op } = require('sequelize');

router.get("/question", tokenVerificationMiddleware, async (req,res) => {
    const check = await track.findOne({
        attributes: ["unit_id"],
        where: {
            user_id: req.user.id,
        },
    });

    const Qnum = [];
    let num;
    for(let i=0; i<5 ; i++){
        do{
            num = Math.floor(Math.random()*(check.unit_id*6))+1;
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
            unit_id: element.unit_id,
            id: element.id,
            choice: [element.word, element.A1, element.A2, element.A3].sort(() => Math.random() - 0.5),
        };
    })
    
    res.json({question: result})
});

router.patch("/answer",tokenVerificationMiddleware ,async (req,res) => {

    const { Q_num, word_id , ans } = req.body;
    const selected_word = await word.findOne({
        attributes: ["word"],
        where: {
            id: word_id,
        },
    });

    let correct = 0;
    const is_correct = selected_word.word == ans; 
    if(is_correct){
        correct = 1;
    }
    
    const exist =await quiz.findOne({
        where: {
            user_id: req.user.id,
        }
    });
    
    if(!exist){
        await quiz.create({
            user_id: req.user.id,
            Q_number : Q_num,
            correct_number : correct,
            days: 1,
            correct_days : 0 ,
        });
        return res.json({ message: "new save"});
    }

    if(Q_num == 1){
        exist.correct_number = 0;
    }

    if(Q_num == 5){
        if(exist.correct_number+correct == 5){
            exist.correct_days++ ;
        }
    }

    await quiz.update({
        Q_number : Q_num,
        correct_number : exist.correct_number+correct,
        days : exist.days++,
        correct_days: exist.correct_days
    },{
        where: {
            user_id: req.user.id
        }
    });

    res.json({ is_correct })
    
});

module.exports = router;