const mongoose=require("mongoose");
const{Schema,model}=require("mongoose");
const{randomBytes,createHmac} =require("crypto");
const{createTokenForUser,validateToken} =require("../services/authentication")

const userSchema=new Schema({
    profileurl:{
        type:String,
        default:"/images/user.png"
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    salt:{
        type:String,
    },
});


//pre function set
userSchema.pre('save',function(next) {

    const user=this;

    if(!user.isModified("password")) return;

    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac('sha256',salt).update(user.password).digest("hex");

    this.salt=salt;
    this.password=hashedPassword;

    next();
})

userSchema.static("matchPasswordAndGenerateToken",async function(username,password){
    
    try{

    const user=await this.findOne({username});
    const salt=user.salt;
    const hashedPassword=user.password;
    
    const userProvidedHash=createHmac('sha256',salt).update(password).digest("hex");

    if(hashedPassword!==userProvidedHash){
        res.render("signin",{
            message:"Incorrect password",
        })
    }

    const token=createTokenForUser(user);
    
    return token;
    }

    catch(error)
    {
        res.render("signin",{
            message:"Incorrect username or password",
        })
    }
})


const User=mongoose.model("User",userSchema,"users");

module.exports=User;