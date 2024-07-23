const mongoose=require("mongoose");
const{Schema,model}=require("mongoose");

const commentSchema=new Schema({
    comment:{
        type:String,
    },
    createdBy:{
        type:String,
        required:true,ref: 'User'
    },
    posterId:{
        type:String,
        required:true,
    }
});

const Comment=new mongoose.model("Comment",commentSchema,"comments");

module.exports=Comment;