const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = process.env;

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send({
            message: 'Access Token is missing'
        });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({
                message: 'Invalid Access Token'
            });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateUser;
