const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2']
}))

const morgan = require('morgan');
app.use(morgan('dev'));

const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcryptjs');

const { gerUserByEmail, generateRandomString } = require('./helpers')

/// function to make sure users can only access their own URL
const urlsForUser = (id) => {
  const urlList= {}
    for (let i in urlDatabase) {
      if (urlDatabase[i]["userID"] === id) {
        urlList[i] = urlDatabase[i]
      }
    }
    return urlList
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
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.redirect("/urls");})

app.get("/urls", (req, res) => {
  if (req.session.user_id) { //// check if user logged in 
    let finalList = urlsForUser(req.session.user_id); /// list of URL a specific user can access
    const templateVars = { 
      urls: finalList, 
      user: users[req.session.user_id], 
      };
    res.render("urls_index", templateVars);
  } else {
    res.render('request_login')
  }
});
  

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) { /// req.session.user_id = userID
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    }
    res.render("urls_new",templateVars )
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    /// in case shortURL or ID is valid
    for (let j in urlDatabase) {
      if(req.params.shortURL === j) {
        const shortURL = req.params.shortURL;
        const longURL = urlDatabase[req.params.shortURL]["longURL"];
        
        const templateVars = { 
          shortURL,
          longURL,
          user: users[req.session.user_id]
        };
        res.render("urls_show", templateVars);
      } 
    }
    //// in case shortURL or ID is invalid
    const templateVars = { 
      user: users[req.session.user_id]
    };
    res.render("wrongID",templateVars)
  } else {
      res.render('request_login')
  }
});

app.post("/urls", (req, res) => {
  
    //// create short randomstring as shortURL:
    const shortURL = generateRandomString() 
    /// add short URL to urlDatabase:
    urlDatabase[shortURL] = {};
    /// add long URL to urldatabase:
    urlDatabase[shortURL]["longURL"] = req.body["longURL"];
    /// add user_ID to urldatabase
    urlDatabase[shortURL]["userID"] = req.session.user_id
    /// add longURL to templateVars: 
    const longURL = urlDatabase[shortURL]["longURL"]; 
    
    // console.log(urlDatabase)
    const templateVars = {
      shortURL,
      longURL,
      user: users[req.session.user_id]
    };
  res.render("urls_show", templateVars);
  
});

app.get("/u/:id", (req,res) => {
  /// check if a URL or ID is valid ?
  if (urlDatabase[req.params.id]) {
    
      const shortURL = req.params.id
      const longURL = urlDatabase[shortURL]["longURL"]
      
      res.redirect(`http://${longURL}`)
   
  } else {
    res.send(`<h3> URL not existed</h3>`)
  }
})

app.post("/urls/:shortURL/delete",(req, res) => { 
  if (req.session.user_id) {
    let finalList = urlsForUser(req.session.user_id);
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL]
    delete finalList[shortURL]
    res.redirect("/urls")
  } else {
    res.render('request_login')
  }
})

app.post("/urls/:shortURL", (req,res) => {
  if(urlDatabase.hasOwnProperty(req.params.shortURL)) {
    if (req.session.user_id) {
      const shortURL = req.params.shortURL;
      const longURL = req.body.longURL;
      urlDatabase[shortURL]["longURL"] = longURL;
      res.redirect("/urls")
    } else {
      res.render('request_login')
    }
  } else {
    res.render('wrongID')
  }
})

app.get ('/login',(req,res) => {
  res.render('login')
}) 

app.post('/login', (req,res) =>{
  const user = gerUserByEmail(req.body.email,users)
  
  if(user) {
    console.log(user)
    if (bcrypt.compareSync(req.body.password, user["password"])) {
      req.session.user_id = user.id;
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
	req.session.user_id = null

	return res.redirect("/urls");
});
  
app.get('/register', (req,res) => {
  res.render('registration')
})

app.get('/login', (req,res) => {
  res.render('login')
})

// || CREATE USERS DATABASE WITH ZERO DATA || 
const  users = {}; 


// || REGISTER || 
app.post('/register', (req,res) => {
  const { email, password, statusCode } = req.body;
  if(email === "" || password === "") {
    return res.send(`invalid email or password, statusCode: ${statusCode}`)
  };
  for (let i in users) {
    if (email === users[i]["email"])  {
    return res.send(`email existed, statusCode: ${statusCode}`)
    }
  };

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user_id = generateRandomString();

  users[user_id] =  {
    id : user_id, 
    email, 
    password: hashedPassword };
  
  req.session.user_id = user_id // set cookies
  res.redirect("/urls")
})