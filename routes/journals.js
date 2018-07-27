var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Journal = require("../models/journal");
var Todo = require("../models/todo.js");
var middleware = require("../middleware");

//JOURNAL ROUTES

//index
router.get("/", middleware.isLoggedIn, function(req, res){
    Journal.find({'author.id': req.user._id}, function(err, journal){
        if(err){
            console.log(err);
        } else{
            Todo.find({'author.id':req.user._id}, function(err, todo){
                if(err){
                    console.log(err);
                } else {
                    res.render("journals/index", {journal: journal, todo: todo});                    
                }
            });
        }
    });
});

//new journal form
router.get("/new", middleware.isLoggedIn, function(req,res){
    Journal.find({'author.id': req.user._id}, function(err, journal){
    if(err){
        console.log(err);
    } else{
        Todo.find({'author.id':req.user._id}, function(err, todo){
            if(err){
                console.log(err);
            } else {
                res.render("journals/new", {journal: journal, todo: todo});                    
            }
        });
    }
    });
});

//create journal
router.post("/", middleware.isLoggedIn, function(req,res){
req.body.journal.body = req.sanitize(req.body.journal.body);
    // get data from form and add to campgrounds array
    var title = req.body.journal.title;
    var image = req.body.journal.image;
    var body = req.body.journal.body;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newJournal= {title: title, image: image, body: body, author: author};
    //create journal
    Journal.create(newJournal, function(err, newJournal){
        if(err){
            res.render("new");
        } else{
            res.redirect("/journals");
        }
    });
});

//edit journal form
router.get("/:id/edit", middleware.checkJournalOwnership, function(req,res){
    Journal.findById(req.params.id, function(err, foundJournal){
        if(err){
            res.redirect("/journals");
        } else{
            
            Todo.find({'author.id':req.user._id}, function(err, todo){
                if(err){
                    console.log(err);
                } else {
                    res.render("journals/edit", {journal: foundJournal, todo: todo});                    
                }
            });
        }
    });
});

//update journal
router.put("/:id", middleware.checkJournalOwnership, function(req, res){
    Journal.findByIdAndUpdate(req.params.id, req.body.journal, function(err, updatedJournal){
       if(err){
           res.redirect("/journals");
       } else{
           res.redirect("/journals/" + req.params.id);
       }
    });
});

//delete journal
router.delete("/:id", middleware.checkJournalOwnership, function(req, res){
    Journal.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/journals");
        } else {
            res.redirect("/journals");
        }
    });
});

//show journal
router.get("/:id", middleware.checkJournalOwnership, function(req, res){
    Journal.findById(req.params.id, function(err, foundJournal){
        if(err){
            console.log(err);
        } 
        Todo.find({'author.id':req.user._id}, function(err, todo){
            if(err){
                console.log(err);
            } else {
                res.render("journals/show", {journal: foundJournal, todo: todo});                    
            }
        });
    });
});

module.exports = router;