var jwt = require('jsonwebtoken');
const JWT_SECRET = 'officialkam$9';

const fetchuser = (req, res, next) => {
   
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ status:'Authentication Failed',desc:"You need to login first",code:0})
    }
    else
    {
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({status: 'Authentication Failed',desc:'User Session is expired, login Again',code:0})
    }
    }

}


module.exports = fetchuser;