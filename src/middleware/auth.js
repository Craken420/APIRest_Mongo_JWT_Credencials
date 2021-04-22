const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async(req, res, next) => {
   const token = req.header('Authorization')
   if (token) {
      const token = token.replace('Bearer ', '')
      jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
         if (err)
             next(err);  //Error, trying to access unauthorized page!
         else {
             if (decoded.exp <= Date.now()) {
                 var err = new Error("Access token has expired");
                 next(err);  //Error, trying to access unauthorized page!
             }
             req.decoded = decoded;
         }
      });
      try {
         const user = await User.findOne({ _id: req.decoded._id, 'tokens.token': token })
         if (!user) {
            let err = new Error("User token not found");
            next(err);
         }
         req.user = user
         req.token = token
         next()
      } catch (error) {
         next(error);
      }
   } else {
      let err = new Error("Token not provided");
      next(err);
   }
}
module.exports = auth