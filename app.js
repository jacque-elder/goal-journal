var express          = require("express"),
    app              = express(),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    flash            = require("connect-flash"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    User             = require("./models/user"),
    Journal          = require("./models/journal.js"),
    Todo             = require("./models/todo.js"),
    middleware       = require("./middleware");

//APP CONFIG
mongoose.connect("mongodb://localhost:27017/goal_progress_app", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Hammy is the cutest",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//ROUTES
app.get("/", function(req, res){
    res.render("landing");    
});

//show login form
app.get("/login", function(req, res){
    res.render("login");
});

//handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/journals",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
app.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/");
});

//show sign up form
app.get("/register", function(req,res){
    res.render("register");
});

//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to Goal Journal " + user.username);
        res.redirect("/journals");
        });
    });
});

//JOURNAL ROUTES

//index
app.get("/journals", middleware.isLoggedIn, function(req, res){
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
app.get("/journals/new", middleware.isLoggedIn, function(req,res){
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
app.post("/journals", middleware.isLoggedIn, function(req,res){
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
app.get("/journals/:id/edit", middleware.checkJournalOwnership, function(req,res){
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
app.put("/journals/:id", middleware.checkJournalOwnership, function(req, res){
    Journal.findByIdAndUpdate(req.params.id, req.body.journal, function(err, updatedJournal){
       if(err){
           res.redirect("/journals");
       } else{
           res.redirect("/journals/" + req.params.id);
       }
    });
});

//delete journal
app.delete("/journals/:id", middleware.checkJournalOwnership, function(req, res){
    Journal.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/journals");
        } else {
            res.redirect("/journals");
        }
    });
});

//show journal
app.get("/journals/:id", middleware.checkJournalOwnership, function(req, res){
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

//todo routes
app.put("/todo/:id", middleware.isLoggedIn, function(req, res){
    Todo.findByIdAndUpdate(req.params.id, {isCompleted: true}, {new: true}, function(err, updatedTodo){
       if(err){
           res.redirect("back");
       } else{
           res.redirect("back");
       }
    });
});

//create new todo
app.post("/todo", middleware.isLoggedIn, function(req,res){
req.body.todo.item = req.sanitize(req.body.todo.item);
    var item = req.body.todo.item;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newTodo= {item: item, author: author};
    //create journal
    Todo.create(newTodo, function(err, newTodo){
        if(err){
            console.log(err);
        } else{
            res.redirect("back");
        }
    });
});

//update todo


//delete todo
app.delete("/todo/:id", middleware.isLoggedIn, function(req, res){
    Todo.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("back");
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Server Has Started!");
});