const {Router}=require("express");
const { Module } = require("module");
const router=Router();

const Poster=require("../models/poster")


const multer=require("multer");
const path=require("path");
const { rmSync } = require("fs");
const User = require("../models/user");
const Comment=require("../models/comment");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/posters/`))
    },
    filename: function (req, file, cb) {
        const fileName=`${Date.now()}-${file.originalname}`
        cb(null,fileName);
      }
  });

const upload = multer({ storage: storage });


router.get("/create",(req,res)=>{
    
    return res.render("posterform",{
        user:req.user,
    });
})


router.post("/comment/:id",async (req,res)=>{

    const poster=await Poster.findById(req.params.id);
    poster.comment+=1;
    await poster.save();

    const userid=req.user._id;

    const posterid=req.params.id;
    const{comment}=req.body;

    await Comment.create({
        comment,createdBy:userid,posterId:posterid,
    })

    return res.redirect(`/poster/${req.params.id}`);
})

router.get("/:id",async (req,res)=>{

    const comments=await Comment.find({posterId:req.params.id}).populate("createdBy");

    const poster=await Poster.findById(req.params.id).populate("createdBy");

    poster.view+=1;
    await poster.save();
    const creator=await User.findById(poster.createdBy);
    return res.render("poster",{
        user:req.user,
        poster:poster,
        creator:creator,
        comments:comments
    })
})

router.post("/create", upload.single('poster') , async (req,res)=>{

    
    const{phonenumber}=req.body;
    const{sportname,date,time,email,username,state,city,zip,location}=req.body;
    var{description}=req.body;
    if(description==""){
        description="Please follow the rules and be aware that any inappropriate behavior will incur a fine. Maintain respect for others. Thank you for visiting this poster, and we hope you will come again. Let's work together to create a positive and enjoyable environment for everyone.";
    }

    const newPoster = await Poster.create(
        {  poster: `/posters/${req.file.filename}`,
           createdBy:req.user._id ,
            sportname,date,time,email,phonenumber,username,state,city,zip,location,description}
    )
    return res.redirect(`/poster/${newPoster._id}`);
    
})

module.exports=router;