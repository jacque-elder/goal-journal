var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Journal = require("../models/journal");
var Todo = require("../models/todo.js");
var middleware = require("../middleware");

//todo routes

//create new todo
router.post("/", middleware.isLoggedIn, function(req,res){
req.body.todo.item = req.sanitize(req.body.todo.item);
    var item = req.body.todo.item;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newTodo = {item: item, author: author};
    Todo.create(newTodo, function(err, newTodo){
        if(err){
            console.log(err);
        } else{
            res.redirect("back");
        }
    });
});

//update todo as completed
router.put("/:id", middleware.isLoggedIn, function(req, res){
    Todo.findByIdAndUpdate(req.params.id, {isCompleted: true}, {new: true}, function(err, updatedTodo){
       if(err){
           res.redirect("back");
       } else{
           res.redirect("back");
       }
    });
});

//delete todo
router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Todo.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("back");
        }
    });
});

module.exports = router;