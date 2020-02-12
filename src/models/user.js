const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require('./task');

const userScema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error("Age must be a positive number");
            }
        }
    },
    email: {
        type: String,
        unique: true,
        require: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid");
            }
        }
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.includes("password")){
                throw new Error("Invalid password");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userScema.virtual('tasks' , {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userScema.methods.toJSON = function ()  {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userScema.methods.generateAuthToken = async function ()  {
    const user = this;
    const token = jwt.sign({_id: user._id.toString() } , process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
};

userScema.statics.findByCredentials = async(email , password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password , user.password );
    if(!isMatch){
        throw new Error("Unable to login");
    }

    return user;
}

//Hash the plain password before saving
userScema.pre('save' , async function (next){
    const user = this;
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
});

//Delete user tasks when user is deleted
userScema.pre('remove' , async function (next){
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
});

const User = mongoose.model("User", userScema);

module.exports = User;