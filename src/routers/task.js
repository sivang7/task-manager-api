const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

router.post("/tasks" , auth , async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e){
        res.status(400).send(e);
    }
});

router.get("/tasks", auth , async (req,res)=>{
    const match = {};
    if(req.query.completed){
        match.completed = req.query.completed === "true" ? true: false;
    }

    const sort = {};
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch(e){
        res.status(500).send();
    }
});

router.get("/tasks/:id", auth , async (req,res)=>{
    const _id = req.params.id;

    try {
        const task = await Task.findOne({_id , owner: req.user._id});
        if(task){
            res.send(task);
        }
        else{
            res.status(404).send();
        }
    } catch (e){
        res.status(500).send();
    }
});

// patch is used to update
router.patch("/tasks/:id" , auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowUpdates = ["description" , "completed"];
    const isValidOperation = updates.every( (update) => allowUpdates.includes(update));
    if(!isValidOperation){
        return res.status(400).send({"error" : "Invalid update params"});
    }
    
    try {
        const task = await Task.findOne({_id: req.params.id , owner: req.user._id});

        if(task){           
            updates.forEach( (update) => task[update] = req.body[update]);
            await task.save();
            res.send(task);
        }
        else{
            res.status(404).send();
        }
    } catch(e){
        res.status(400).send(e);
    }
});

router.delete("/tasks/:id" , auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id , owner: req.user._id});
        if(task){
            res.send(task);
        }
        else{
            res.status(404).send();
        }
    } catch(e){
        res.status(400).send(e);
    }
});
module.exports = router;