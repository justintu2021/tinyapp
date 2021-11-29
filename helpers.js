const generateRandomString= function() {
  return Math.random().toString(20).substr(2, 6)
  }
  
const gerUserByEmail = (email,database) => {
    for (key in database) {
      if (database[key].email === email) {
        return key
      }
    }
    return null;
  }


  module.exports = { gerUserByEmail, generateRandomString }