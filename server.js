//import express
const express = require("express");
//import mongodb
const mongodb = require("mongodb");
//import cors
const cors = require("cors");
//import body-parser
const bodyParser = require("body-parser");

//create server in express
const app = express();

//use middlewares
app.use(cors());
app.use(bodyParser.json());

//database url
const dbUrl = "mongodb+srv://gaurav:gaurav1316@cluster0.4edhx.mongodb.net/TodoDatabase?retryWrites=true&w=majority";

//connect to database url or mongodb
mongodb.MongoClient.connect(
  dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err, client) => {
    if (err) {
      return console.log(err);
    }
    console.log("connected to mongoDb");
    const newDB = client.db("todoDataBaseProject");
    //api creste here

    //signup api
    app.post("/signup", (request,response) => {
      console.log(request.body);
      const { name,phoneNumber,email,password} = request.body;

      //check if user already exist
      let existinguser = newDB
      .collection("user")
      .find({email:email })
      .toArray();
      existinguser.then((user) => {
         //if user exist
         if(user.length > 0) {
           return response.status(201).json("user already exist");
         }
         //if user does not exist
         else if (user.length < 1) {
           let createuser = newDB
           .collection("user")
           .insertOne({
             name: name,
             phoneNumber: phoneNumber,
             email: email,
             password: password,
           });
           createuser.then((user) => {
             response.status(200).json(user.ops);
           });
         }
      });
    });

    //login api
    app.post("/login",(req,res)=>{
      console.log(req.body);
      const {email,password}=req.body;

      //check user existence
      let existinguser=newDB.collection('user').find({email:email}).toArray();
      existinguser.then((user)=>{
        console.log("user=",user)
        //if user not exist
        if(user.length<1){
          return res.status(201).json("user does not exist,plese signup instead")
        }
        //if user exist
        else if(user.length>0){
          //if pass mtch
          if(password===user[0].password){
            return res.status(200).json(user)
          }
          //if pass not match
          else{
            res.status(201).json("password did not match");
          }
        }
      }).catch(err=> {
        console.log(err)
      })
    })
    //api for create todo
app.post("/createTodo",(req,res)=>{
  console.log(req.body);
  const{title,description,deadline,userId}=req.body;

  let createdTodo=newDB.collection('todo').insertOne({title:title,description:description,deadline:deadline,userId:userId})
  createdTodo.then((Todo)=>{
    console.log(Todo);
    return res.status(200).json(Todo.ops[0]);
  })
  .catch(err=>{
    return res.status(500).json("Error in saving Todo");
  })
});

//get todo
app.get("/getTodo/:userId",(req,res)=>{
  console.log(req.params.userId);

  //get all todo for logged user
  let allTodo=newDB.collection('todo').find({userId:req.params.userId}).toArray();
  allTodo.then((Todo)=>{
    console.log(Todo);
    return res.status(200).json(Todo);
  })
  .catch(err=>{
    return res,status(500).json("Error in getting todo");
  })
})

//delete todo
app.delete("/deleteTodo/:userId/:todoId", (req, res)=> {
  console.log(req.params.todoId);

  let deleteTodo = newDB
  .collection("todo")
  .deleteOne({ _id: new mongodb.ObjectID(req.params.todoId)});
  deleteTodo.then((Todo) => {
    console.log(Todo);
    // get all todo for logged user
    let allTodo = newDB
    .collection("todo")
    .find({ userId:req.params.userId })
    .toArray();
    allTodo
       .then((Todo) => {
         console.log(Todo);
         return res.status(200).json(Todo);
       })
       .catch((err) => {
         return res.status(500).json("Error in getting todo");
       })
  })
})
   //api for updation of todo
   app.patch("/updateTodo",(req,res)=> {
     console.log(req.body);
     let updateTodo=newDB.collection('todo').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.todoId)},
     {
       $set:{
         title:req.body.title,
         description:req.body.description,
         deadline:req.body.deadline
       }
     }, {new: true,runValidators:true,returnOriginal:false})
     updateTodo.then(Todo=>{
       console.log(Todo);
       let allTodo = newDB
       .collection("todo")
       .find({userId:req.body.userId })
       .toArray();
       allTodo
       .then((Todo) =>{
         console.log(Todo);
         return res.status(200).json(Todo);
       })
       .catch((err) =>{
         return res.status(500).json("Error in getting todo");
       });
     })
   })
  }
);


//run server
app.listen(8081, () => {
  console.log("server started");
});