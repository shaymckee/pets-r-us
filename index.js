/*
  Title: Project Assignment - Pets-R-Us
  Author: Shay McKee
  Date: 09/04/2022
  Description: Node.js, express, and mongoDB application
*/

// Import
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const moment = require("moment");
// const flash = require("express-flash");
const flash = require("connect-flash");
const fs = require("fs");

// const helmet = require("helmet");
// const csurf = require("csurf");
// const csurfProtection = csrf({ cookie: true });

// mongoose model imports
const User = require("./models/user.js");
const Appointment = require("./models/appointments.js");

// set the view engine to html
// app.engine(".html", require("ejs").__express);

// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "html");

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files
app.use(express.static("public"));
app.use("/styles", express.static(__dirname + "public/styles"));
// app.use('/js', express.static(__dirname + 'public/js'))
app.use("/images", express.static(__dirname + "public/images"));
app.use(cookieParser());
app.use(express.json());

//MiddleWare
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
// app.use(cookieParser());

//CSRF
// app.use(csurfProtection);
// app.use((req, res, next) => {
//   const token = req.csrfToken();
//   res.cookie("XSRF-TOKEN", token);
//   res.locals.csrfToken = token;
//   next();
// });

//Helmet method that prevents cross-site scripting
// app.use(helmet.xssFilter());

//Passport
app.use(
  session({
    secret: "s3cret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const PORT = process.env.PORT || 3001;
const CONN =
  "mongodb+srv://apriladmin:apriladmin@buwebdev-cluster-1.yfwec.mongodb.net/web340DB";
// const message = " Welcome to the Pets-R-Us website"

// connect to mongoDB atlas
mongoose
  .connect(CONN)
  .then(() => {
    console.log("Connection to the database was successful");
  })
  .catch((err) => {
    console.log("MongoDB Error: " + err.message);
  });

//Passport
app.use((req, res, next) => {
  if (req.session.passport) {
    console.log(req.session.passport.user);
    res.locals.currentUser = req.session.passport.user;
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// index page
app.get("/", function (req, res) {
  res.render("index");
});

// grooming page
app.get("/grooming", function (req, res) {
  res.render("grooming");
});

// training page
app.get("/training", function (req, res) {
  res.render("training");
});

// Boarding page
app.get("/boarding", function (req, res) {
  res.render("boarding");
});

// render sign up page
// find user function
app.get("/register", (req, res) => {
  User.find({}, function (err, users) {
    console.log(users);
    if (err) {
      console.log(err);
    } else {
      res.render("register", {
        title: "Pets-R-Us: Sign Up",
        cardTitle: "Sign Up",

        moment: moment,
        users: users,
      });
    }
  });
});

// handling user signup with username, email, and password by passport
app.post("/register", function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;

  User.register(
    new User({
      username: username,
      email: email,
    }),
    password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.render("/register");
      }

      passport.authenticate("local")(req, res, function () {
        res.redirect("/register");
      });
    }
  );
});

// Get log in page
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Pets-R-Us: Log in",
    cardTitle: "Log In",
  });
});

// handle log in by passport
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

// log out user , route return to home
app.get("/logout", (req, res, next) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);

    res.redirect("/");
  });
});

// render schedule page
// schedule appointment
app.get("/schedule", isLoggedIn, function (req, res) {
  let servicesDataJsonFile = fs.readFileSync("./public/data/services.json");
  let services = JSON.parse(servicesDataJsonFile);

  Appointment.find({}, function (err, appointments, users) {
    console.log(appointments);
    if (err) {
      console.log(err);
    } else {
      res.render("schedule", {
        title: "Pets-R-Us: schedule",
        cardTitle: "Book your appointment",
        services: services,
        appointments: appointments,
        // userName:userName
      });
    }
  });
});

// check isLoggedIn
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    // req.flash("error", "You needed to be logged in to visit that page!");
    res.redirect("/login");
  }
}

// schedule appointment with firstName, lastName, email, and services
app.post("/schedule", isLoggedIn, (req, res, next) => {
  // const username = res.locals.currentUser;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let services = req.body.services;

  // let userName = req.body.username;

  console.log(req.body);

  let schedule = new Appointment({
    // userName: username,
    firstName: firstName,
    lastName: lastName,
    email: email,
    services: services,
  });

  Appointment.create(schedule, function (err, schedule) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("./profile");
    }
  });
});

// find appointment data from json
app.get("/api/appointments", isLoggedIn, async (req, res) => {
  Appointment.find({}, function (err, appointments) {
    console.log(appointments);
    if (err) {
      console.log(err);
    } else {
      res.json(appointments);
    }
  });
});

// logged in user profile with appointments (still working on only showing logged in user's appointments)
app.get("/profile", isLoggedIn, async (req, res) => {
  // let username = req.session.passport.user;
  // let email = req.body.email;
  // res.locals.currentUser = username;
  // Appointment.findOne({ username: username }, function (err, appointments) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     // res.json(appointments);
  //     res.render("profile", {
  //       title: "Pets-R-Us: profile",
  //       cardTitle: "My Profile",
  //       appointments: appointments,
  //       email: email,
  //       username: username,
  //     });
  //   }
  // });

  let username = req.session.passport.user;
  let email = req.user.email;
  res.locals.currentUser = username;
  Appointment.findOne({ email: email }, function (err, appointments) {
    if (err) {
      console.log(err);
    } else {
      // res.json(appointments);
      res.render("profile", {
        title: "Pets-R-Us: profile",
        cardTitle: "My Profile",
        appointments: appointments,
        email: email,
        username: username,
      });
    }
    console.log(email);
    console.log(appointments);
  });
});

app.post("/profile", (req, res) => {
  const userProfile = {
    username: currentUser.username,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };
  console.log(userProfile);
});

// wire up server
app.listen(PORT, function () {
  console.log("Server Has Started!");
});