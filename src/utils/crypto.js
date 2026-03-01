const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const saltRounds = 10;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};
