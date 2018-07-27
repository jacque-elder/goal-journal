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
    
var indexRoutes    = require("./routes/index"),
    journalRoutes    = require("./routes/journals"),
    todoRoutes      = require("./routes/todos");

//APP CONFIG
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
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

app.use("/", indexRoutes);
app.use("/journals", journalRoutes);
app.use("/todos", todoRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("The Server Has Started!");
});