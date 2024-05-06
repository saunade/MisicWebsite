const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { ServerMonitoringMode } = require("mongodb");
const ejs = require('ejs');
const cors = require('cors');


app.set('view engine', 'ejs')

var path = require('path');
var revenue =0;
var users = [];


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


mongoose.connect("mongodb+srv://sbalouchi:406proj@406proj.4t8vwym.mongodb.net/406proj", { useNewUrlParser: true }, { useUnifedTopology: true})

//schema
const userSchema = {
    name: String,
    password: String,
    email: String,
    memberId: String,
    money: Number
}

const User = mongoose.model("user", userSchema);


const loginSchema = {
    username: String,
    password: String
}

const LoginU = mongoose.model("Login", loginSchema);

const paymentSchema = {
    MemberID: String,
    First_Name: String,
    Last_Name: String,
    Card_Num: String,
    Valid_Date: String,
    CVV: Number,
    Paid_Amount: Number
}

const payment = mongoose.model("payment", paymentSchema);


//puts all users into a list
User.find({}).then((res) => {
    for (i in res) {
        revenue += res[i].money;
        users.push(res[i]);
        console.log('yay');
    }  
}).catch((err) => {
    console.log('code broke');

});


//handles webpage changes
app.get("/", function(req, res){
    res.render("Home");
})

app.get("/Register.html", function(req, res){
    res.sendFile(__dirname + "/Register.html");
})

app.get('/Login.html', function (req, res) {
    res.sendFile(__dirname + "/Login.html");
});

app.get('/Home.html', function (req, res) {
    res.sendFile(__dirname + "/Home.html");
});

app.get('/Members.html', function (req, res) {
    res.sendFile(__dirname + "/Members.html");
});

app.get('/Finances.html', function (req, res) {
    res.sendFile(__dirname + "/Finances.html");
});

app.get('/Admin_Login.html', function (req, res) {
    res.sendFile(__dirname + "/Admin_Login.html");
});

app.get('/member_dashboard.html', function (req, res) {
    res.sendFile(__dirname + "/member_dashboard.html");
});

app.get('/MemberTable.html', function (req, res) {
    res.render("MemberTable", {userr: users});
});

app.get('/UpcomingPractices.html', function (req, res) {
    res.sendFile(__dirname + "/UpcomingPractices.html");
});
app.get('/Coach.html', function (req, res) {
    res.sendFile(__dirname + "/Coach.html");
});

app.get('/Treasurer.html', (req, res) => {

    res.render("Treasurer", {myRevenue: revenue, userr: users.sort((a, b) => a.money-b.money)}) 

});

app.get('/payment_portal.html', function (req, res) {
    res.sendFile(__dirname + "/payment_portal.html");
});

app.get('/revenue_calc.html', function (req, res) {
    res.sendFile(__dirname + "/revenue_calc.html");
});


app.post("/register", function(req, res){
    //console.log(req.body.username)
    let newUser = new User({
        name: req.body.username,
        password: req.body.password,
        memberId: generateMemberId(),
        email: req.body.email,
        money: 0
    });
    newUser.save();

    res.redirect("/Login.html");
})

app.post("/login", function(req, res) {
    User.findOne({ memberId: req.body.uname }).then(user => {
        console.log("Found user:", user); // Add this line
        console.log("Request body:", req.body); // Add this line
        if (user) {
            User.findOne({ memberId: req.body.uname, password: req.body.psw }).then(matchedUser => {
                console.log("Matched user:", matchedUser); // Add this line
                if (matchedUser) {
                    res.redirect("/member_dashboard.html");
                } else {
                    res.redirect("/login.html?error=wrong_credentials");
                }
            });
        } else {
            res.redirect("/login.html?error=wrong_credentials");
        }
    });
});

app.post("/payment", function(req, res){
    console.log(req.body.mem_id)
    let newUser = new payment({
        MemberID: req.body.mem_id,
        First_Name: req.body.FName,
        Last_Name: req.body.LName,
        Card_Num: req.body.Card_Num,
        Valid_Date: req.body.Valid,
        CVV: req.body.cvv,
        Paid_Amount: req.body.amnt
    });
    newUser.save();
    res.redirect("/member_dashboard.html");
})

app.post("/calculate-revenue", async function(req, res) {
    try {
        const payments = await payment.find({}, 'Paid_Amount'); // Find all documents and select only Paid_Amount field
        let totalRevenue = 0;
        payments.forEach(payment => {
            totalRevenue += payment.Paid_Amount;
        });
        res.send({ totalRevenue }); // Sending totalRevenue as an object
    } catch (error) {
        console.error("Error calculating revenue:", error);
        res.status(500).send("Error calculating revenue");
    }
});


app.listen(3000, function() {
    console.log("server is running on 3000");
})

// Function to generate a random member ID
function generateMemberId() {
    let memberId = '';
    for (let i = 0; i < 4; i++) {
        memberId += Math.floor(Math.random() * 10); 
    }
    return memberId;
}
