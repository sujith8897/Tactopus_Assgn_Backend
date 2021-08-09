const express = require('express');
const app = express();
const client = require('./database');
var multer = require('multer');
var multiparty = require('multiparty');



const add_teacher = `insert into tactopus.teachers
(teacher_id, services, languages, experience, teacher_name, image_name) values
((select max(teacher_id) + 1 from tactopus.teachers), $1, $2, $3, $4, $5)`;

const get_services = `select * from tactopus.services;`;
const get_languages = `select * from tactopus.languages;`;
const get_all_teachers = `select * from tactopus.teachers where teacher_id > 999 ;`;
const sort_teachers_name = `select * from tactopus.teachers where teacher_id > 999 order by teacher_name asc;`;
const sort_teachers_exp = `select * from tactopus.teachers where teacher_id > 999 order by experience asc;`;
const get_teacher_info = `select * from tactopus.teachers where teacher_id = $1;`;
const edit_teacher = `update tactopus.teachers set services = $1, languages = $2, experience = $3,
                    teacher_name = $4, image_name = $5 where teacher_id = $6;`;
const delete_teacher = `delete from tactopus.teachers where teacher_id = $1;`;
const get_teachers_exp_filter = `select * from tactopus.teachers where experience <= $1 and teacher_id > 999;`;

app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static(__dirname + '/uploads'));

//CORS(cross origin req security) code to terminate req from local:4200 and to only take local:3000
app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested_With, Content-Type, Accept");
    next();
});

client.connect()
.then(() => console.log("Database connected successfully"));

var fileNew;
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename:(req,file,cb) =>{
        fileNew = file;
        cb(null, `Image-${file.originalname}`)
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');

app.get("/", (req,res) =>{
    res.send("hi");
});

app.get("/services", (req,res) => {
    client.query(get_services, (err,results) => {
        if(!err){
            console.log(results.rows);
            res.send(results.rows);
        }else{
            console.log(err);
        }
    });
});

app.get("/languages", (req,res) => {
    client.query(get_languages, (err,result) => {
        if(!err){
            console.log(result.rows);
            res.send(result.rows);
        }else{
            console.log(err);
        }
    });
});

app.get("/get-all-teachers", (req,res) => {
    var result = {};
    if(req.query.exp){
        client.query(get_teachers_exp_filter,[req.query.exp],(err,results)=>{
            if(!err){
                res.send(results.rows);
            }else{
                console.log(err);
            }
        })
    }
    else{
        var mainQuery = get_all_teachers;
        if(req.query.sortBy){
            var sortQuery ;
            if(req.query.sortBy == "teacher_name"){
                sortQuery = sort_teachers_name;
            }else{
                sortQuery = sort_teachers_exp;
            }
            mainQuery = sortQuery;
        }
            client.query(mainQuery, (err,results) =>{
                if(!err){
                    console.log(results.rows);
                    
                    res.send(results.rows);
                }else{
                    console.log(err);
                }
            });
        

    }

});

app.get("/get-teacher-info", (req,res) =>{
    var id = req.query.id;
    console.log('id----',id);
    client.query(get_teacher_info, [id], (err,results) =>{
        if(!err){
            console.log(results.rows);
            res.send(results.rows[0]);
        }else{
            console.log(err);
        }
    })
});

app.post("/add-teacher", (req,res) => {

    upload(req,res, (err) =>{
        console.log('req----',req.body);
        data = req.body;
        data.services = JSON.parse(data.services);
        data.languages = JSON.parse(data.languages);
        s = '{';
        l = '{';
        for(i in data.services){
            s+='"'+data.services[i]+'",';
            l+='"'+data.languages[i]+'",';
        }
        s = s.slice(0, -1) + '}';
        l = l.slice(0, -1) + '}';
        data.services = s;
        data.languages = l;
        console.log(data.services,data.languages);
        if(err){
            console.log(err);
        } else{
            console.log("uploaded");
            //console.log(fileNew.originalname);
            if(fileNew==undefined){
                image_name = 'http://localhost:3000/tactopus_logo.jpg';
            }else{
                image_name ='http://localhost:3000/Image-' + fileNew.originalname;
            }
            
        }

        console.log('exceuite-------',data);
        //data.services = {"1","2"};
        client.query(add_teacher, [data.services, data.languages, data.experience, data.name, image_name], (err,results) =>{
            console.log("entered query",data,data.experience);
            if(!err){
                //console.log(results);
                res.status(200).json({status: "success", message: "Teacher Added Successfully"});
            } else{
                console.log(err);
                res.status(701).json({status: "error", message: "Unsuccessfull"});
            }
        })
        fileNew="";
    });

});

app.post("/edit-teacher", (req,res) =>{
    var id = req.query.id;
    upload(req,res, (err) =>{
        console.log('req----',req.body);
        data = req.body;
        data.services = JSON.parse(data.services);
        data.languages = JSON.parse(data.languages);
        s = '{';
        l = '{';
        for(i in data.services){
            s+='"'+data.services[i]+'",';
            l+='"'+data.languages[i]+'",';
        }
        s = s.slice(0, -1) + '}';
        l = l.slice(0, -1) + '}';
        data.services = s;
        data.languages = l;
        console.log(data.services,data.languages);
        if(err){
            console.log(err);
        } else{
            console.log("uploaded");
            //console.log(fileNew.originalname);
            if(fileNew==undefined){
                image_name = 'http://localhost:3000/tactopus_logo.jpg';
            }else{
                image_name ='http://localhost:3000/Image-' + fileNew.originalname;
            }
            
        }

        console.log('exceuite-------',data);
        //data.services = {"1","2"};
        client.query(edit_teacher, [data.services, data.languages, data.experience, data.name, image_name, id], (err,results) =>{
            console.log("entered query",data,data.experience);
            if(!err){
                //console.log(results);
                res.status(200).json({status: "success", message: "Teacher Added Successfully"});
            } else{
                console.log(err);
                res.status(701).json({status: "error", message: "Unsuccessfull"});
            }
        })
        fileNew="";
    });
});

app.get("/delete-teacher", (req,res) =>{
    var id = req.query.id;
    client.query(delete_teacher,[id],(err,results) =>{
        if(!err){
            console.log("success");
            res.status(200).json({status:"success", message:"successfully deleted"});
        }else{
            console.log(err);
            res.status(701).json({status:"error", message:"Unsuccessfull deleting teacher"});
        }
    })
})


app.listen(3000, ()=>{
    console.log("Server connected on port 3000");
});
