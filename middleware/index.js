var middlewareObj = {};
var Journal = require("../models/journal");

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

middlewareObj.checkJournalOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Journal.findById(req.params.id, function(err, foundJournal){
            if(err || !foundJournal){
                req.flash("error", "Journal not found");
            } else{
                if(foundJournal.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

module.exports = middlewareObj;