var express          = require("express"),
    app              = express(),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    flash            = require("connect-flash"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    User             = require("./models/user");

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

//MONGOOSE MODEL CONFIG
var journalSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Journal = mongoose.model("Journal", journalSchema);

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
app.get("/journals", function(req, res){
    Journal.find({}, function(err, journal){
        if(err){
            console.log("error");
        } else{
            res.render("journals/index", {journal: journal});
        }
    });
});

//new journal form
app.get("/journals/new", function(req,res){
    res.render("journals/new");
});

//create journal
app.post("/journals", function(req,res){
req.body.journal.body = req.sanitize(req.body.journal.body);
    //create blog
    Journal.create(req.body.journal, function(err, newJournal){
        if(err){
            res.render("new");
        } else{
            res.redirect("/journals");
        }
    });
});

//edit journal form
app.get("journals/edit", function(req, res){
    res.render("edit");
});

//update journal
app.post("journals/:id", function(req, res){
    
});

//delete journal
app.delete("journal/:id", function(req, res){
    
});

//show journal
app.get("/journals/:id", function(req, res){
    res.render("journals/show");
});


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Server Has Started!");
});