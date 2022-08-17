const express = require('express');
const router = express.Router();

const { track , unit, word } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');
const { Op } = require('sequelize');

router.post("/add", async (req,res) => {
    await unit.create ();

    res.json({ massage: "success" });
});

router.post("/add/word", async (req,res) => {
    const { unit_id, new_word } = req.body;

    let exist = await unit.findOne({
        where: {
            id: unit_id
        }
    });

    if(!exist){
        return res.status(400).json({ message: "this unit not exist!!!"});
    }

    exist = await word.findOne({
        where: {
            unit_id,
            word: new_word,
        }
    });

    if(exist){
        return res.status(400).json({ message: "this word already exist!!!"});
    }

    await word.create ({
        unit_id,
        word: new_word,
    });

    res.json({ massage: "success" });
});

router.patch("/track", tokenVerificationMiddleware, async (req,res) => {

    const { now_unit } = req.body;

    const last_unit = await track.findOne({
        attributes: ["id", "unit_id"],
        where: {
            id: req.user.id,
        },
    });

    if(!last_unit){
        await track.create({
            user_id: req.user.id,
            unit_id: now_unit,
        });
        return res.json({ message: "new save"});
    }
    
    if(last_unit.unit_id < now_unit){
        last_unit.unit_id = now_unit;
        await last_unit.save();
    }
    return res.json({ massage: "success"});

});

router.get("/word", tokenVerificationMiddleware, async (req,res) => {

    const unitid = await track.findOne({
        attributes: ["unit_id"],
        where: {
            id: req.user.id,
        },
    });

    const result = await unit.findAll({
        attributes: ["id"],
        include: {
            model: word,
            attributes: ["word"],
        },
        order: [
            [word, "id", "asc"],
        ],
        where: {
            id: {
                [Op.lte] : unitid.unit_id,
            },
        },
    });

    res.json({word: result})
});

/*router.post("/question", tokenVerificationMiddleware, async (req,res) => {
   
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
*/

module.exports = router;