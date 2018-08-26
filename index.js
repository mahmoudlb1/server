const express = require("express");
const cors =require("cors");
const server =express();
const bodyParser =require("body-parser");
const {connection}= require("./Connection");
const uuidv4 =require("uuid/v4");
const fs =require("fs");

const PORT = process.env.PORT||8000;
server.listen(PORT,()=>{
    console.log(`Server is running on Localhost: ${PORT}`);
})

server.use(express.static('public'));
server.use(bodyParser.json());
server.use(cors({origin:"http://localhost:3000"}));

server.get("/get/jokes",(request,response)=>{
    connection.query(`select * from joke `,(error,results)=>{
    if(error){
        showError(error,response);
    }
    response.json(results);
    })
})

server.post("/update/joke/:vote",(request,response)=>{
    const { body } = request;
    if(body){
        const { id } = body;
        if(id){
            let sql;
            const vote= request.params.vote;
            if(vote==="upvote")
             sql ="update joke set up_votes =up_votes + 1 where id = ? ";
            else
             sql ="update joke set down_votes =down_votes + 1 where id = ? ";
            let values = [id];
            connection.query(sql,values,(error,results)=>{
                if(error){
                    showError(error,response);
                }
                response.json({status: "succes",  message: "joke voted"})
            })
        }
    }
})
function showError(error,response){
    console.log(error);
    response.json({status:"error",message:"something went wrong "});
}

server.post("/post/joke",(request,response)=>{
    const {body}= request;
    if(body){
        const{title,file} = body;
        if(file){
            const {base64}=file;
            const fileName =uuidv4();
            fs.writeFile(`./public/images/${fileName}.jpeg`,base64,'base64',(error)=>{
                if(error){
                    console.log(error);
                }
            })
            const sql = "INSERT into joke set ?";
            const values ={
                image_location:`http://10.20.0.48:8000/images/${fileName}.jpeg`,
                title
            }
        
            connection.query(sql,values,(error,result)=>{
            if(error) showError(error,response);
            response.json({status: "succes",  message: "joke uploaded"})
            })
        }   
    }
})

//Get a single joke
server.get("/get/joke/:id",(request,response)=>{
    const {id}= request.params;
    const values=[id];
    connection.query(`select * from joke where id =? `,values,(error,results)=>{
    if(error){
        showError(error,response);
    }
    response.json(results[0]);
    })
});

//Get comments per joke
server.get("/get/comments/:jokeId",(request,response)=>{
    const {jokeId} = request.params;
    const values = [jokeId];
    connection.query(`select * from comment where joke_id=?`,values,(error,results)=>{
        if(error)
        showError(error.response);
        response.json(results);
    });
});

//Post a comment
server.post("/post/comment",(request,response)=>{
    const {body} = request;
    if(body){
        const{text,username,joke_id} = body;
        const sql ="insert into comment set ?";
        const values = {
            text,
            username,
            joke_id
        }
        connection.query(sql,values,(error,result)=>{
            if(error){
                showError(error,response);
            }
            response.json({status: "succes",  message: "comment posted"})
        });
    }
});
