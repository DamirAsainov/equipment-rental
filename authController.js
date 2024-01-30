const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs')
const {validationResult} = require("express-validator");
const jwt = require('jsonwebtoken');
const {secret} = require('./config')

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"})
}
async function getUsers() {

}
async function registration(req,res) {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(400).json({message: "Registration Error", errors})
            return;
        }
        const {username, password} = req.body;
        const candidate = await User.findOne({username});
        if (candidate) {
            res.status(400).json({message: "User with this username already exist"});
            return;
        }
        const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(7))
        const userRole = await Role.findOne({value: "USER"})
        const user = new User({username, password: hashPassword, roles: [userRole.value]})
        await user.save();
        res.json({message: "User successfully added"});
    } catch (err){
        console.log(err)
        res.status(400).json({message: 'registration error'})
    }
}

async function login (req, res) {
    try{

        const username = await req.body.username;
        const password = await req.body.password;
        console.log(username +" " + password)
        const user = await User.findOne({username});
        if(!user){
            res.status(400).json({message: `User "${username}"is not exist`})
            return;
        }
        const validPassword = bcrypt.compareSync(password, user.password)
        if(!validPassword){
            res.status(400).json({message: 'Password is not correct'})
        }
        const token = generateAccessToken(user._id, user.roles)
        console.log(token)
        res.json({token})
    } catch (e){
        console.error(e);
        res.status(400).json({message: e})
    }
}

module.exports.getUsers = getUsers;
module.exports.registration = registration;
module.exports.login = login;
