let jwt = require('jsonwebtoken');

let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
        return res.status(404).json({ success: false, error: 'Token is not valid' });
    }
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, process.env.PRIVATE_KEY, (err, userInfo) => {
            if (err) {
                return res.status(401).json({ success: false, error: 'Token is not valid' });
            } else {
                req.user = userInfo;
                next();
            }
        });
    }
};

module.exports = {
    checkToken: checkToken
};
