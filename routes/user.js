const {Router}=require("express");
const { Module } = require("module");
const router=Router();
const User=require("../models/user")

// const{}=require("../models/user");

const multer=require("multer");
const path=require("path");
const fs=require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/users/`))
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
  });

const upload = multer({ storage: storage });

router.get("/signup",(req,res)=>{
    return res.render("signup");
})


router.post('/signup', upload.single('profileurl'), async (req, res) => {
    const { username, password } = req.body;
  
    try {
      
  
      const user = await User.findOne({ username });
      if (user) {
        return res.render('signup', {
          message: 'Username already exists',
        });
      }
  
      if(req.file){

      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = username + ext;
  
      const oldPath = path.join('./public/users/', req.file.filename);
      const newPath = path.join('./public/users/', filename);
  
      fs.renameSync(oldPath, newPath);
        await User.create({
            username,
            password,
            profileurl: `/users/${filename}`,
          });

      }
      else{

        await User.create({
            username,
            password,
          });

      }
      return res.render('signin', {
        username: username,
        password: password,
      });
    } 
    catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).render('signup', {
        message: 'Server error',
      });
    }
  });

router.get("/signin",(req,res)=>{
    return res.render("signin");
})

router.post("/signin",async (req,res)=>{
    
    
    const {username,password}=req.body;
    try{
        
        const token=await User.matchPasswordAndGenerateToken(username,password);
        
        return res.cookie("token",token).redirect("/");
    }
    catch(error){
        
        return res.render("signin",{
            message:"Incorrect Username or Password"
        })
    }
})

router.get("/logout",async (req,res)=>{
    res.clearCookie("token");
    return res.redirect("/");
})

module.exports=router;