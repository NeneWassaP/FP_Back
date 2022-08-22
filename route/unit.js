const express = require('express');
const router = express.Router();

const { track , unit, word, answer } = require('./../models');
const { tokenVerificationMiddleware } = require('./../middleware');
const { Op } = require('sequelize');

router.post("/add", async (req,res) => {
    await unit.create ();

    res.json({ massage: "success" });
});

router.post("/add/word", async (req,res) => {
    const { unit_id, new_word, word_A1, word_A2, word_A3 } = req.body;

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
        A1 : word_A1,
        A2 : word_A2,
        A3 : word_A3,
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
            unit_id: 1,
        });
        return res.json({ message: "new save"});
    }
    
    if(last_unit.unit_id < now_unit){
        last_unit.unit_id = now_unit;
        await last_unit.save();
    }
    return res.json({ massage: "success"});

});

router.get("/track", tokenVerificationMiddleware, async (req,res) => {

    const last_unit = await track.findOne({
        attributes: ["unit_id"],
        where: {
            user_id: req.user.id,
        },
    });

    if (!last_unit) {
        return res.json({ unit: 1});
    }

    if (await answer.findOne({ where: { user_id: req.user.id, unit_id: last_unit.unit_id } })) {
        last_unit.unit_id += 1;
    }

    return res.json({ unit: last_unit.unit_id});

});

router.post("/word", async (req,res) => {

    const { unit_id } = req.body;

    const result = await word.findAll({
        attributes: ["id", "word"],
        order: [["id", "asc"]],
        where: {
            unit_id: unit_id
        },
    });

    res.json({word: result})
});

router.get("/words", tokenVerificationMiddleware, async (req,res) => {

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

module.exports = router;