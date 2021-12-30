/*
    Name: Lucas Abeln
    Class: Web Development
    Assignment: WPD4
    Last Modified: 12/6/21
    Desc: Main App File
*/

//App set up variables.
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const { MongoClient, ConnectionClosedEvent } = require('mongodb');
const uri = "mongodb+srv://labeln:Exerlog@cluster0.5s7rl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var ObjectId = require("mongodb").ObjectID;
var sanitize = require('mongo-sanitize');
var user;
let date_ob = new Date();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

//Connect to Mongo
client.connect(err => { 
    if(err) throw err;
   db = client.db("Champlog").collection("workout");
   login = client.db("Champlog").collection("Name");
   console.log("Connected!");
});

app.use(express.urlencoded({
   extended: true
}));

//Listen on port 3000
app.listen(3000, function() {
   console.log("Listening on port 3000...");
});

//Get request for login page.
app.get("/", (req, res) => {
   res.render("login.ejs");
});

//Getter for error page
app.get("/error", (req, res) => {
    res.render("error.ejs");
 });

//Post for main page, unique to user.
app.post("/start", (req, res) =>{
   console.log(req.body);
   user = req.body;
   console.log(user);
   if(user.username != ''){
        login.findOne({username: user.username}, function(err, doc) {
            if( doc == null ) {
                login.insertOne(req.body, (err, result) => {
                if (err) return console.log("Error: " + err);
                    console.log("Successfully saved to the database!");
                    res.redirect("/start");
                });
            } else {
                res.redirect("/start");
            }
        });
    }
    else{res.redirect("/")}
});


//Post to log page, also inserts username into log cluster.
app.post("/show", (req, res) => {
    console.log(req.body);
    var monthID;
    clean = sanitize(req.body)
    if(req.body.month == "January"){
        monthID = "1";
    }
    if(req.body.month == "February"){
        monthID = "2";
    }
    if(req.body.month == "March"){
        monthID = "3";
    }
    if(req.body.month == "April"){
        monthID = "4";
    }
    if(req.body.month == "May"){
        monthID = "5";
    }
    if(req.body.month == "June"){
        monthID = "6";
    }
    if(req.body.month == "July"){
        monthID = "7";
    }
    if(req.body.month == "August"){
        monthID = "8";
    }
    if(req.body.month == "September"){
        monthID = "9";
    }
    if(req.body.month == "October"){
        monthID = "10";
    }
    if(req.body.month == "November"){
        monthID = "11";
    }
    if(req.body.month == "December"){
        monthID = "12";
    }
    /*if(!req.body.time.includes(':') || isNaN(req.body.Intensity) || isNaN(req.body.day)){
        res.redirect("/error");
    }*/
    else{
        db.insertOne(Object.assign(clean, {"username": user.username, "monthID": monthID}), (err, result) => {
            if (err) return console.log("Error: " + err);
            console.log("Successfully saved to the database!");
            res.redirect("/show");
        });
    }
});

//Renders main page.
app.get("/start", (req, res)=>{
      db.find({username: user.username}).toArray((err, results) => {
        if (err) return console.log("Error: " + err);
        res.render("page.ejs", {
            exer: results
        });
    });
})

//Gets certain workoutss from the database, sorts by date if the user toggles that oprion. BIG thanks to MongoDB forum for teaching me about collation function
//which allowed me to sort by numbers with more than one digit.
app.get("/workoutType", (req, res) => {
    console.log(req.query.sort);
    console.log(req.query.typeChoice);
    if(req.query.sort){
        if(req.query.typeChoice == "All"){
            db.find({username: user.username}).sort({monthID: 1, day: 1}).collation({ locale: "en_US", numericOrdering: true }).toArray((err, results) => {
                if (err) return console.log("Error: " + err);
                res.render("show.ejs", {
                    exer: results
                });
            });
        }
        else{
            db.find({type: req.query.typeChoice, username: user.username}).sort({monthID: 1, day: 1}).collation({ locale: "en_US", numericOrdering: true }).toArray((err, results) => {
                if (err) return console.log("Error: " + err);
                res.render("show.ejs", {
                    exer: results
                });
            });
        }
    }    
    else{
        if(req.query.typeChoice == "All"){
            db.find({username: user.username}).toArray((err, results) => {
                if (err) return console.log("Error: " + err);
                res.render("show.ejs", {
                    exer: results
                });
            });
        }
        else{
            db.find({type: req.query.typeChoice, username: user.username}).toArray((err, results) => {
                if (err) return console.log("Error: " + err);
                res.render("show.ejs", {
                    exer: results
                });
            });
        }
    }
});
//Get request for log page.
app.get("/show", (req, res) => {
    db.find({username: user.username}).toArray((err, results) => {
        if (err) return console.log("Error: " + err);
        res.render("show.ejs", {
            exer: results
        });
    });
});

//Get Workouts by past date.
app.get("/get", (req, res) => {
    db.find({year: req.query.year, month: req.query.month, day: req.query.day}).toArray((err, results) => {
        if(err) return console.log("Error: " + err);
        res.render("get.ejs", {
            exer: results
        });
    });
});


//Enables delete funtionality, deletes by user because each log has a username associated with it in the DB.
app.route("/delete/:id")
    .get((req, res) => {
        let id = req.params.id;
        let query = {
            _id: ObjectId(id)
        };
        db.find(query).toArray(function (err, result) {
            if (err) throw err;
            console.log("Deleted from the database: " + JSON.stringify(result));
        });
        db.deleteOne({
            _id: ObjectId(id)
        }, (err, result) => {
            if (err) return res.send(500, err);
            console.log("Entry removed from the database!");
            res.redirect("/show");
        });
    });

function parseTime( t ) {
    var d = new Date();
    var time = t.match( /(\d+)(?::(\d\d))?\s*(p?)/ );
    d.setHours( parseInt( time[1]) + (time[3] ? 12 : 0) );
    d.setMinutes( parseInt( time[2]) || 0 );
    return d;
}

