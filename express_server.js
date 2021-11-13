const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const morgan = require('morgan');
app.use(morgan('dev'));

const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//////////////////// helper functions////////////////////////////////////////

function generateRandomString() {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = 6;
    for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
  }

  const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};const gerUserByEmail = (email) => {
    for (key in users) {
      if (users[key].email === email) {
        return users[key]
      }
    }
    return null;
  }

  

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const  users = {};
///////////////////////helper functions//////////////////////////////////////////////////

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.user_id], 
    };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[this.shortURL],
    user: users[req.cookies.user_id]
    };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString() //// randomURL = shortURL
  urlDatabase[shortURL] = req.body["longURL"] /// add new shortURL & long URL to urldatabase
  const longURL = urlDatabase[shortURL] /// add longURL to templateVars

  const templateVars = {
    shortURL,
    longURL,
    user: users[req.cookies.user_id]
   };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req,res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL)
})

app.post("/urls/:shortURL/delete",(req, res) => { 
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls")
})

app.get ('/login',(req,res) => {
  res.render('login')
}) 

app.post('/login', (req,res) =>{
  const user = gerUserByEmail(req.body.email)
  
  if(user) {
    if (req.body.password === user.password) {
      res.cookie("user_id",user.id);
      res.redirect('/urls')
    } else {
      res.send("Incorrect password");
      }
  } else {
    res.send("not found!")
  }
}
)

app.post("/logout", (req, res) => {
	res.clearCookie("user_id");

	return res.redirect("/urls");
});
  
app.get('/register', (req,res) => {
  res.render('registration')
})

app.get('/login', (req,res) => {
  res.render('login')
})


app.post('/register', (req,res) => {
  const { email, password, statusCode } = req.body;
  if(email === "" || password === "") {
    return res.send(`invalid email or password, statusCode 400`)
  };
  for (let i in users) {
    if (email === users[i]["email"])  {
    return res.send(`email existed, statusCode 400`)
    }
  };

  const user_id = generateRandomString();
  users[user_id] =  {
    id : user_id, 
    email, 
    password }
  
  res.cookie("user_id",user_id)
  console.log(users)
  res.redirect("/urls")
})





