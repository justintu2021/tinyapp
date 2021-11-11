const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
////////////////////////////////////////////////////////////

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  templateVars["username"]= req.cookies["username"];
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username : req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  templateVars["username"]= req.cookies["username"];
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const randomURL = generateRandomString() //// randomURL = shortURL
  urlDatabase[randomURL] = req.body["longURL"] /// add new shortURL & long URL to database
  const longURL = urlDatabase[randomURL]
  const templateVars = { shortURL: randomURL, longURL: longURL};
  templateVars["username"]= req.cookies["username"];
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req,res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL]
  console.log(shortURL)
  res.redirect(longURL)
})

app.post("/urls/:shortURL/delete",(req, res) => { 
  console.log(req.params)
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase[shortURL])
  console.log(urlDatabase)
  res.redirect("/urls")
})

app.post('/login', (req,res) =>{
  const { username } = req.body
  res.cookie("username", username)
  console.log(username)
  res.redirect("/urls")
})

app.post('/logout',(req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})
