const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');


const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {email:'',password:''};

    if(err.message === 'incorrect email'){
      errors.email = 'That Email is not registered.'
    }

    if(err.message === 'incorrect password'){
      errors.password = 'That password is incorrect.'
    }

    if (err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    

    return errors;
}

const maxTokenAge = 3 * 24 * 60 * 60;
const createToken = (id) =>{
  return jwt.sign({id},secret,{
    expiresIn: maxTokenAge
  });
}
module.exports = {secret};

module.exports.login_get = (req,res) => {
    res.render('login');
}

module.exports.login_post = async(req,res) => { 
  const {email,password} = req.body;
  try{
    const userLogin = await userModel.login(email,password); // change User to userModel
    const userToken = createToken(userLogin._id);
    res.cookie('jwt',userToken,{httpOnly: true, maxTokenAge: maxTokenAge * 1000});
    res.status(200).json({userLogin: userLogin._id});
  }catch(err){
    const errors = handleErrors(err);
    res.status(400).json({errors});
  }
}



module.exports.signup_get = (req,res) => {
    res.render('signup');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    try {
      const newUser = await userModel.create({ email, password }); //asynchronous task to post data into db.
      const userToken = createToken(newUser._id);
      res.cookie('jwt',userToken,{httpOnly: true, maxTokenAge: maxTokenAge * 1000});
      res.status(201).json({newUser: newUser._id});
    } catch (err) {
      const errors = handleErrors(err);
      if (err.code === 11000) { // check if the error is due to duplicate key (email)
        errors.email = 'Email already exists. Try creating a new one.';
        res.status(400).json({ errors });
      } else {
        console.log(err);
        res.status(400).json({ errors });
      }
    }
  }
  
  
  module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  }
