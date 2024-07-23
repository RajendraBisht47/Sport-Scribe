const JWT=require("jsonwebtoken");

const secret="$rajendra";

function createTokenForUser(user){
    const payload={
        _id:user._id,
        username:user.username,
        profileurl:user.profileurl,
        fullname:user.fullname,
    };
    const token =JWT.sign(payload,secret);
    return token;
}

function validateToken(token){
    const payload=JWT.verify(token,secret);
    return payload;
}

module.exports={
    createTokenForUser,validateToken
}