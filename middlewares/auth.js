const jwt = require('jsonwebtoken');
const {User} = require('../models/models');



const auth = async(req,res,next)=>{
    try {
        const tokenExtracted = await jwt.verify(req.cookies.authToken, 'iambunnyandiloveblackcolorbecauseihateblackcolorbecauseiaminwhiteandiamsinglecoreprocessortaskcapable')
        const userData = await User.findOne({_id:tokenExtracted.id});
        req.USER_ID = userData._id;
        req.ROOT_USER = userData;
        next();
    } catch (error) {
        // res.status(401).send({message:'No Token Received'});
        console.log('Token Not Received')
        next()
    }
}

module.exports = auth