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

const bcrypt = require('bcryptjs');
//////////////////// helper functions//////////////////////////////////////////////////////////////////

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
  
const gerUserByEmail = (email) => {
    for (key in users) {
      if (users[key].email === email) {
        return users[key]
      }
    }
    return null;
  }

const urlsForUser = (id) => {
  const urlList= {}
    for (let i in urlDatabase) {
      if (urlDatabase[i]["userID"] === id) {
        urlList[i] = urlDatabase[i]
      }
    }
    return urlList
  }
///////////////////////helper functions///////////////////////////////////////////////////////////////////

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };



// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
const  users = {};

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


app.get("/urls", (req, res) => {

  if (req.cookies.user_id) {
    let finalList = urlsForUser(req.cookies.user_id);
    const templateVars = { 
      urls: finalList, 
      user: users[req.cookies.user_id], 
      };
    res.render("urls_index", templateVars);
  } else {
    res.render('request_login')
  }
});
  

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id]
    }
    res.render("urls_new",templateVars )
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies.user_id) {
    /// in case shortURL or ID is valid
    for (let j in urlDatabase) {
      if(req.params.shortURL === j) {
        const shortURL = req.params.shortURL;
        const longURL = urlDatabase[req.params.shortURL]["longURL"];
        
        const templateVars = { 
          shortURL,
          longURL,
          user: users[req.cookies.user_id]
        };
        res.render("urls_show", templateVars);
      } 
    }
    //// in case shortURL or ID is invalid
    const templateVars = { 
      user: users[req.cookies.user_id]
    };
    res.render("urls_wrongIDshow",templateVars)
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
    urlDatabase[shortURL]["userID"] = req.cookies.user_id
    /// add longURL to templateVars: 
    const longURL = urlDatabase[shortURL]["longURL"]; 
    
    console.log(urlDatabase)
    const templateVars = {
      shortURL,
      longURL,
      user: users[req.cookies.user_id]
    };
  res.render("urls_show", templateVars);
  
});

app.get("/u/:id", (req,res) => {
  if(urlDatabase[req.params.id]) {
    if (req.cookies.user_id) {
      const shortURL = req.params.id
      const longURL = urlDatabase[shortURL]["longURL"]
      res.redirect(longURL)
    } else {
      console.log(urlDatabase[req.params.id] === true)
      res.render('request_login')
    }
  } else {
    res.render('ulrs_wrongIDshow')    
}
})

app.post("/urls/:shortURL/delete",(req, res) => { 
  if (req.cookies.user_id) {
    let finalList = urlsForUser(req.cookies.user_id);
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL]
    delete finalList[shortURL]
    res.redirect("/urls")
  } else {
    res.render('request_login')
  }
})

app.post("/urls/:shortURL", (req,res) => {
  if(urlDatabase[req.params.id]) {
    if (req.cookies.user_id) {
      const shortURL = req.params.shortURL;
      const longURL = req.body.longURL;
      urlDatabase[shortURL]["longURL"] = longURL;
      res.redirect("/urls")
    } else {
      res.render('request_login')
    }
  } else {
    res.render('ulrs_wrongIDshow')
  }
})

app.get ('/login',(req,res) => {
  res.render('login')
}) 

app.post('/login', (req,res) =>{
  const user = gerUserByEmail(req.body.email)
  
  if(user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
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
    password: hashedPassword }
  
  res.cookie("user_id",user_id)
  console.log(users)
  res.redirect("/urls")
})





