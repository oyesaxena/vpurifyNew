//jshint esversion:6
require('dotenv').config()
const StripeSecretKey = process.env.STRIPE_SECRET_KEY
const AWSSecretKey=process.env.AWS_SECRET_KEY
const AWSAccessKey=process.env.AWS_ACCESS_KEY

const express =require("express");
const ejs = require("ejs");
const path = require("path");
const fs = require('fs')
var stripe=require("stripe")('sk_test_51Gs3hQJKmdeuOmy6CoC4pJ2bwnzFAqE95aVk7DOcsNaf041wjgkFlYhp5xYDC4enc0nfjKIQoAZGQE9pvxC2CFI200Rdjol9zY')
const bodyParser = require("body-parser");
const mongoose=require("mongoose")
const app=express();
const _ = require("lodash");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var __ = require('lodash/core');
var fp = require('lodash/fp');
var array = require('lodash/array');
var object = require('lodash/fp/object');
var at = require('lodash/at');
var Int32 = require('mongoose-int32');
var curryN = require('lodash/fp/curryN');
const encrypt=require("mongoose-encryption");
var QRCode      =   require('qrcode');
var multer  = require('multer')
multerS3 = require('multer-s3')
aws = require('aws-sdk')
var Insta = require('instamojo-nodejs');
const { isArray } = require('lodash');
Insta.setKeys('0fb25e803cc49feab974241b72b917f2', '41512bff3ce3147476da293e6843f8fd');


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect('mongodb+srv://vpurify:vpurify@vpurify-267xm.mongodb.net/vpurify?retryWrites=true',{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:true });

aws.config.update({
    secretAccessKey: AWSSecretKey,
    accessKeyId: AWSAccessKey,
    region: 'us-east-2'
});
s3 = new aws.S3();
  var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'vpurify',
        key: function (req, file, cb) {
            // var newFileName = Date.now() + "-" + file.originalname
            console.log(file);
            cb(null,'foo-folder/' + Date.now() + '_' +  file.originalname); //use Date.now() for unique file keys
        }
    })
});

const userSchema=new mongoose.Schema({
    email: {type:String,trim:true},
    name:{type:String},
    password:{type:String} ,
    phone:{type:String,trim:true},
    profile:{type:String,trim:true},
    adress:{type:String,trim:true},
    vehicleType:{type:String,trim:true},
    vehicleCompany:{type:String,trim:true},
    model:{type:String,trim:true},
    number:{type:String,trim:true},
    year:{type:String,trim:true},
    coins:{
        type:Number,
        default:0,
        min:0
        
    },
    cartCoins:{type:Number,default:0},cartAmount:{type:Number,default:0},
    homeBookings:[{name:{type:String,trim:true},email:{type:String,trim:true},phone:{type:String,trim:true},address:{type:String,trim:true},city:{type:String,trim:true},slot:{type:String,trim:true},date:{type:String,trim:true},coins:Number}],
    officeBookings:[{name:{type:String,trim:true},email:{type:String,trim:true},phone:{type:String,trim:true},address:{type:String,trim:true},city:{type:String,trim:true},slot:{type:String,trim:true},date:{type:String,trim:true},coins:Number}],
    completed:[{date:{type:String,trim:true},startTime:{type:String,trim:true},endTime:{type:String,trim:true},name:{type:String,trim:true},location:{type:String,trim:true},coins:Number}],
    lastDate:{type:String,trim:true,default:" "},lastStartTime:{type:String,trim:true,default:" "},lastEndTime:{type:String,trim:true,default:" "},lastImages:[]
})

const coinsSchema =new mongoose.Schema({
    range:Number,
    price:Number    
})



const secret="Thisisourlittlesecret."
userSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});


const registeredServiceSchema= new mongoose.Schema({
    email: {type:String,trim:true},
    name:{type:String},
    password: {type:String},
    phone:{type:String,trim:true},
    pin:{type:String,trim:true},
    firm:{type:String,trim:true},
    gst:{type:String,trim:true},
    address:{type:String,trim:true},
    number:{type:String,trim:true},
    city:{type:String,trim:true},
    state:{type:String,trim:true},
    proofs:[],
    
})

const rejectedServiceSchema= new mongoose.Schema({
    email: {type:String,trim:true},
    name:{type:String},
    phone:{type:String,trim:true},
    pin:{type:String,trim:true},
    firm:{type:String,trim:true},
    gst:{type:String,trim:true},
    address:{type:String,trim:true},
    number:{type:String,trim:true},
    city:{type:String,trim:true},
    state:{type:String,trim:true},
    
    
})

const ServiceSchema= new mongoose.Schema({
    email: {type:String,trim:true},
    name:{type:String},
    password: {type:String},
    phone:{type:String,trim:true},
    pin:{type:String,trim:true},
    firm:{type:String,trim:true},
    gst:{type:String,trim:true},
    address:{type:String,trim:true},
    number:{type:String,trim:true},
    city:{type:String,trim:true},
    state:{type:String,trim:true},
    proofs:[],
    homeSlots:[{time:[{ type:String, trim: true, default:["No slots available today"] }], date:{type:String,trim:true}}],
    officeSlots:[{time:[{ type:String, trim: true, default:["No slots available today"] }], date:{type:String,trim:true}}],
    homePendings:[{name:{type:String,trim:true},model:{type:stripe,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},slot:{type:String,trim:true},vehicleNo:{type:String,trim:true},date:{type:String,trim:true},userQR:{type:String,trim:true},address:{type:String,trim:true},model:{type:String},coins:Number}],
    officePendings:[{name:{type:String,trim:true},model:{type:stripe,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},slot:{type:String,trim:true},vehicleNo:{type:String,trim:true},date:{type:String,trim:true},userQR:{type:String,trim:true},model:{type:String},coins:Number}],
    homeEmployees:[{name:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},pin:{type:String,trim:true},city:{type:String,trim:true}}],
    officeEmployees:[{name:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},pin:{type:String,trim:true},city:{type:String,trim:true}}],
    completedBookings:[{date:{type:String,trim:true},startTime:{type:String,trim:true},endTime:{type:String,trim:true},vehicleNo:{type:String,trim:true},customer:{type:String,trim:true},location:{type:String,trim:true},coins:Number,model:{type:String,trim:true}}],
    homeMulti:Number,homeMaxi:Number,homeAuto:Number,homeSUV:Number,homeHatchback:Number,homeSmall:Number,homeSedan:Number,homeTwoWheeler:Number,homeTempo:Number,homeBus:Number,homeOthers:Number,
    officeMulti:Number,officeMaxi:Number,officeAuto:Number,officeSUV:Number,officeHatchback:Number,officeSmall:Number,officeSedan:Number,officeTwoWheeler:Number,officeTempo:Number,officeBus:Number,officeOthers:Number

})

const registeredEmployeeSchema= new mongoose.Schema({
    email: {type:String,trim:true},
    name:{type:String},
    password: {type:String},
    phone:{type:String,trim:true},
    pin:{type:String,trim:true},
    education:{type:String,trim:true},
    experience:{type:String,trim:true},
    city:{type:String,trim:true},
    number:{type:String,trim:true},
    resume:[],
    
})

const rejectedEmployeeSchema= new mongoose.Schema({
    email: {type:String,trim:true},
    name:{type:String},
    phone:{type:String,trim:true},
    pin:{type:String,trim:true},
    education:{type:String,trim:true},
    experience:{type:String,trim:true},
    city:{type:String,trim:true},
    number:{type:String,trim:true}
})

const EmployeeSchema= new mongoose.Schema({
    email: {type:String,trim:true},
    name:{type:String},
    password: {type:String},
    phone:{type:String,trim:true},
    pin:{type:String,trim:true},
    education:{type:String,trim:true},
    experience:{type:String,trim:true},
    city:{type:String,trim:true},
    number:{type:String,trim:true},
    resume:[],
    company:{type:String,trim:true},
    pendings:[{name:{type:String,trim:true},model:{type:String,trim:true},address:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},slot:{type:String,trim:true},vehicleNo:{type:String,trim:true},model:{type:String},date:{type:String,trim:true},coins:Number}],
    completedWork:[{date:{type:String,trim:true},startTime:{type:String,trim:true},endTime:{type:String,trim:true},phone:{type:String,trim:true},customer:{type:String,trim:true},coins:Number}],post:{type:String,trim:true}

})

registeredEmployeeSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});
EmployeeSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});


registeredServiceSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});

ServiceSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});



const regEmployee=new mongoose.model("regEmployee",registeredEmployeeSchema);
const Employee=new mongoose.model("Employee",EmployeeSchema);
const rejectedEmployee=new mongoose.model("rejectedEmployee",rejectedEmployeeSchema);
const User= new mongoose.model("User",userSchema);
const rejectedService=new mongoose.model("rejectedService",rejectedServiceSchema);
const regService=new mongoose.model("regService",registeredServiceSchema);
const Service=new mongoose.model("Service",ServiceSchema);
const Coin=new mongoose.model("Coin",coinsSchema);

app.get("/",function(req,res){
    res.render("home")
})






app.get("/login",function(req,res){
    res.render("login");
})



app.get("/qrCode/:userId",function(req,res){
    requestedQR=req.params.userId;
    User.findOne({_id:requestedQR},function(err,user){
        let temp=[{}]
        let name=user.name
        temp.push("Name: ")
        temp.push(name)
        temp.push(" ")
        let phone=user.phone
        temp.push("Contact: ")
        
        temp.push(phone)
        temp.push(" ")
        let email=user.email
        temp.push("Email: ")
        temp.push(email)
        temp.push(" ")
        
        let vehicleType=user.vehicleType
        temp.push("Vehicle Type: ")
        temp.push(vehicleType)
        temp.push(" ")
        let vehicleCompany=user.vehicleCompany
        temp.push("Vehicle Company: ")
        temp.push(vehicleCompany)
        temp.push(" ")
        let vehicleModel=user.model
        temp.push("Model: ")
        temp.push(vehicleModel)
        temp.push(" ")
        let vehicleNo=user.number
        temp.push("Vehicle Number: ")
        temp.push(vehicleNo)
        temp.push(" ")
        let passingYear=user.year
        temp.push("Passing Year: ")
        temp.push(passingYear)
        temp.push(" ")
        let lastDate=user.lastDate
        temp.push("Last Date: ")
        temp.push(lastDate)
        temp.push(" ")
        let lastStartTime=user.lastStartTime
        temp.push("Start Time: ")
        temp.push(lastStartTime)
        temp.push(" ")
        let lastEndTime=user.lastStartTime
        temp.push("End Time")
        
        temp.push(lastEndTime)
        temp.push(" ")
        let frontImage=user.lastImages[0].location
        temp.push("Front Image: ")
        temp.push(frontImage)
        temp.push(" ")
        let backImage=user.lastImages[1].location
        temp.push("Back Image: ")
        temp.push(backImage)
        
        // var lastTime=user.completed[-1].endTime
        // temp.push(lastTime)
        // var firstPic=user.completed[-1].pics[0].location
        // temp.push(firstPic)
        
        QRCode.toDataURL(temp,function (err, url){
            console.log(url)
            res.render("qr",{data:url})
            
        })
    })
})

app.get("/search/qrCode/:userId",function(req,res){
    requestedQR=req.params.userId;
    User.findOne({_id:requestedQR},function(err,user){
        var temp=[{}]
        var name=user.name
        temp.push("Name: ")
        temp.push(name)
        temp.push(" ")
        var phone=user.phone
        temp.push("Contact: ")
        
        temp.push(phone)
        temp.push(" ")
        var email=user.email
        temp.push("Email: ")
        temp.push(email)
        temp.push(" ")
        
        var vehicleType=user.vehicleType
        temp.push("Vehicle Type: ")
        temp.push(vehicleType)
        temp.push(" ")
        var vehicleCompany=user.vehicleCompany
        temp.push("Vehicle Company: ")
        temp.push(vehicleCompany)
        temp.push(" ")
        var vehicleModel=user.model
        temp.push("Model: ")
        temp.push(vehicleModel)
        temp.push(" ")
        var vehicleNo=user.number
        temp.push("Vehicle Number: ")
        temp.push(vehicleNo)
        temp.push(" ")
        var passingYear=user.year
        temp.push("Passing Year: ")
        temp.push(passingYear)
        temp.push(" ")
        var lastDate=user.lastDate
        temp.push("Last Date: ")
        temp.push(lastDate)
        temp.push(" ")
        var lastStartTime=user.lastStartTime
        temp.push("Start Time: ")
        temp.push(lastStartTime)
        temp.push(" ")
        var lastEndTime=user.lastStartTime
        temp.push("End Time")
        
        temp.push(lastEndTime)
        temp.push(" ")
        let frontImage=user.lastImages[0].location
        temp.push("Front Image: ")
        temp.push(frontImage)
        temp.push(" ")
        let backImage=user.lastImages[1].location
        temp.push("Back Image: ")
        temp.push(backImage)
        
        // var lastDate=user.completed[-1].date
        // temp.push(lastDate)
        // var lastTime=user.completed[-1].endTime
        // temp.push(lastTime)
        // var firstPic=user.completed[-1].pics[0].location
        // temp.push(firstPic)
        
        QRCode.toDataURL(temp,function (err, url){
            console.log(url)
            res.render("qr",{data:url})
            
        })
    })
})

app.get("/admin",function (req,res) {
    res.render("admin")
    
})

app.get("/subscription/qrCode/:userId",function(req,res){
    requestedQR=req.params.userId;
    User.findOne({_id:requestedQR},function(err,user){
        var temp=[{}]
        var name=user.name
        temp.push("Name: ")
        temp.push(name)
        temp.push(" ")
        var phone=user.phone
        temp.push("Contact: ")
        
        temp.push(phone)
        temp.push(" ")
        var email=user.email
        temp.push("Email: ")
        temp.push(email)
        temp.push(" ")
        
        var vehicleType=user.vehicleType
        temp.push("Vehicle Type: ")
        temp.push(vehicleType)
        temp.push(" ")
        var vehicleCompany=user.vehicleCompany
        temp.push("Vehicle Company: ")
        temp.push(vehicleCompany)
        temp.push(" ")
        var vehicleModel=user.model
        temp.push("Model: ")
        temp.push(vehicleModel)
        temp.push(" ")
        var vehicleNo=user.number
        temp.push("Vehicle Number: ")
        temp.push(vehicleNo)
        temp.push(" ")
        var passingYear=user.year
        temp.push("Passing Year: ")
        temp.push(passingYear)
        temp.push(" ")
        var lastDate=user.lastDate
        temp.push("Last Date: ")
        temp.push(lastDate)
        temp.push(" ")
        var lastStartTime=user.lastStartTime
        temp.push("Start Time: ")
        temp.push(lastStartTime)
        temp.push(" ")
        var lastEndTime=user.lastStartTime
        temp.push("End Time")
        
        temp.push(lastEndTime)
        temp.push(" ")
        let frontImage=user.lastImages[0].location
        temp.push("Front Image: ")
        temp.push(frontImage)
        temp.push(" ")
        let backImage=user.lastImages[1].location
        temp.push("Back Image: ")
        temp.push(backImage)
        
        QRCode.toDataURL(temp,function (err, url){
            console.log(url)
            res.render("qr",{data:url})
            
        })
    })
})


app.get("/user/:userId",function(req,res){
    requestedUserInfo=req.params.userId;
    User.findOne({_id:requestedUserInfo},function(err,user){

        res.render("userInfo",{
            name:user.name,
            email:user.email,
            address:user.address,
            contact:user.phone,
            vehicleType:user.vehicleType,
            vehicleCompany:user.vehicleCompany,
            model:user.model,
            number:user.number,
            year:user.year,
        })
    })
})

app.get("/services",function(req,res){
    regService.find({},function(err,services){
        res.render("services",{
            services:services
        })
    })
})


app.get("/regEmployees",function(req,res){
    regEmployee.find({},function(err,employees){
        res.render("registeredEmployees",{
            employees:employees
        })
    })
})

app.get("/coins/:coinId",function(req,res){
    const requestedCoin=req.params.coinId;
    Coin.findOne({_id:requestedCoin},function(err,coin){
        res.render("payment",{
            price:coin.coins[0].price
        })
    })
})



// app.post('/purchase', function(req, res) {
//     fs.readFile('items.json', function(error, data) {
//       if (error) {
//         res.status(500).end()
//       } else {
//         const itemsJson = JSON.parse(data)
//         const itemsArray = itemsJson.music.concat(itemsJson.merch)
//         let total = 0
//         req.body.items.forEach(function(item) {
//           const itemJson = itemsArray.find(function(i) {
//             return i.id == item.id
//           })
//           total = total + itemJson.price * item.quantity
//         })
  
//         stripe.charges.create({
//           amount: total,
//           source: req.body.stripeTokenId,
//           currency: 'inr'
//         }).then(function() {
//           console.log('Charge Successful')
//           res.json({ message: 'Successfully purchased items' })
//         }).catch(function() {
//           console.log('Charge Fail')
//           res.status(500).end()
//         })
//       }
//     })
//   })



app.get("/userverify",function(req,res){
    res.render("userverify")
})

app.get("/userreg",function(req,res){
    res.render("userreg");
})

app.get("/servicereg",function(req,res){
    res.render("servicereg")
})

app.get("/search",function(req,res){
    res.render("search")
})

app.get("/result",function(req,res){
    res.render("result")
})

app.route("/homeRates/:serviceId")

.get(function(req,res){
    requestedService=req.params.serviceId
    Service.findOne({_id:requestedService},function(err,service){
        res.render("homeRate",{
            service:service
        })
    })
})

app.post("/homeRate",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeSedan:req.body.sedan,
            homeAuto:req.body.auto,
            homeBus:req.body.bus,
            homeTwoWheeler:req.body.twoWheeler,
            homeHatchback:req.body.hatchback,
            homeMaxi:req.body.maxi,
            homeMulti:req.body.multi,
            homeOthers:req.body.others,
            homeSUV:req.body.suv,
            homeTempo:req.body.tempo,
            homeSmall:req.body.small

        }
    },function(err){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/verifiedServices")
        }
    }

    
    )
})

app.route("/officeRates/:serviceId")

.get(function(req,res){
    requestedService=req.params.serviceId
    Service.findOne({_id:requestedService},function(err,service){
        res.render("officeRate",{
            service:service
        })
    })
})

app.post("/officeRate",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            officeSedan:req.body.sedan,
            officeAuto:req.body.auto,
            officeBus:req.body.bus,
            officeTwoWheeler:req.body.twoWheeler,
            officeHatchback:req.body.hatchback,
            officeMaxi:req.body.maxi,
            officeMulti:req.body.multi,
            officeOthers:req.body.others,
            officeSUV:req.body.suv,
            officeTempo:req.body.tempo,
            officeSmall:req.body.small

        }
    },function(err){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/verifiedServices")
        }
    }

    
    )
})





app.route("/homeStation/:stationId")

.get(function(req,res){
    const requestedStationId=req.params.stationId;
    Service.findOne({_id:requestedStationId},function(err,service){
        res.render("addHomeSlots")
    })
})

.post(function(req,res){
    const requestedStationId=req.params.stationId;
    Service.updateOne({_id:requestedStationId},{
                $push:{
                    homeSlots:{time:req.body.newTime,
                           date:req.body.newDate        
                    }
                },
                
            },
            {
                overwrite:true
            },
            function(err){
                if(!err){
                    res.render("addHomeSlots")
                }
                else{
                    console.log(err)
                }
            }
            )

})

app.route("/officeStation/:stationId")

.get(function(req,res){
    const requestedStationId=req.params.stationId;
    Service.findOne({_id:requestedStationId},function(err,service){
        res.render("addOfiiceSlots")
    })
})

.post(function(req,res){
    const requestedStationId=req.params.stationId;
    Service.updateOne({_id:requestedStationId},{
                $push:{
                    officeSlots:{time:req.body.Time,
                           date:req.body.newDate        
                    }
                },
                
            },
            {
                overwrite:true
            },
            function(err){
                if(!err){
                    res.render("addOfiiceSlots")
                }
                else{
                    console.log(err)
                }
            }
            )

})

app.get("/homeService/:stationName",function(req,res){
    const requestedStationName=req.params.stationName;
    Service.findOne({firm: requestedStationName}, function(err,service){
		res.render("homeSlots", {
		//   image: blog.image,
          slots:service.homeSlots,
          service:service		
        });
	  });
})

app.get("/officeService/:stationName",function(req,res){
    const requestedStationName=req.params.stationName;
    Service.findOne({firm: requestedStationName}, function(err,service){
		res.render("officeSlots", {
		//   image: blog.image,
          slots:service.officeSlots,
          service:service		
        });
	  });
})




app.route("/homeApprove/:empId")

.get(function(req,res){
    const requestedEmp=req.params.empId
    Service.find({},function(err,services){
        regEmployee.findOne({_id:requestedEmp},function(err,employee){
            res.render("homeApproveEmp",{
            employee:employee,
            services:services
            })
        })
    })
    
})

.post(function(req,res){
    const requestedEmp=req.params.empId
    const company=req.body.company
    regEmployee.findOne({_id:requestedEmp},function(err,employee){
        const newEmployee = new Employee({
            name:employee.name,
            email:employee.email,
            phone:employee.phone,
            pin:employee.pin,
            education:employee.education,
            experience:employee.experience,
            city:employee.city,
            company:req.body.company,
            posting:req.body.posting,
            password:employee.password,
            resume:employee.resume,
            post:req.body.post
        })
        newEmployee.save(function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("employee added")
            }
        })
    })

    regEmployee.findOne({_id:requestedEmp},function(err,employee){
        Service.updateOne({firm:company},
            {
                $push:{
                    homeEmployees:{
                        name:employee.name,
                        phone:employee.phone,
                        email:employee.email,
                        pin:employee.pin,
                        city:employee.city
                    }
                }
            },
            {
                overwrite:true
            },
            function(err){
                if(err){
                    console.log(err)
                }
                else{
                    console.log("alloted")
                }
            }
            )
    })

    regEmployee.remove({_id:requestedEmp},function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("deleted")
            res.redirect("/regEmployees")
        }
    })
})

app.post("/serviceReject",function (req,res) {
    newRejectedService= new rejectedService({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        address:req.body.address,
        pin:req.body.pin,
        state:req.body.state,
        city:req.body.city,
        gst:req.body.gst,
        firm:req.body.firm,
        number:req.body.number,
        
    })
    newRejectedService.save(function (err) {
        if(err){
            console.log(err)
        }
        else{
            console.log("rejected")
        }
        
    })
    regService.remove({_id:req.body.id},function (err) {
        if(err){
            console.log(err)
        }
        else{
            console.log("removed")
            res.redirect("/services")
        }
        
    })
    
})

app.get("/rejectedServices",function (req,res) {
    rejectedService.find({},function (err,services) {
        res.render("rejectedServices",{
            services:services
        })
        
    })
    
})



app.get("/rejectedEmployees",function (req,res) {
    rejectedEmployee.find({},function (err,employees) {
        res.render("rejectedEmployees",{
            employees:employees
        })
        
    })
    
})

app.get("/addedCoins",function(req,res){
    Coin.find({},function(err,coins){
        res.render("addedCoins",{
            coins:coins
        })
    })
})

app.post("removeCoin",function(req,res){
    Coin.remove({_id:req.body.id},function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/addedCoins")
        }
    })
})

app.get("/users",function(req,res){
    User.find({},function(err,users){
        res.render("users",{
            users:users
        })
    })

})

app.get("/employees",function (req,res) {
    Employee.find({},function (err,employees) {
        res.render("Employees",{
            employees:employees
        })        
    })
    
})

app.post("/rejectEmployee",function (req,res) {
    const id=req.body.id
    newRejectedEmployee=new rejectedEmployee({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        city:req.body.city,
        pin:req.body.pin,
        education:req.body.education,
        experience:req.body.experience
    })
    newRejectedEmployee.save(function (err) {
        if (err){
            console.log(err)
        }else{
            console.log("done")
            
        }
        
    })
    regEmployee.remove({_id:id},function (err) {
        if(err){
            console.log(err)
        }else{
            res.redirect("/regEmployees")
        }
        
    })
    
})

app.get("/document/:serviceId",function(req,res){
    Service.findOne({_id:req.params.serviceId},function(err,service){
        res.render("documents",{
            proofs:service.proofs
        })
    })
})


app.route("/officeApprove/:empId")

.get(function(req,res){
    const requestedEmp=req.params.empId
    Service.find({},function(err,services){
        regEmployee.findOne({_id:requestedEmp},function(err,employee){
            res.render("officeApproveEmp",{
            employee:employee,
            services:services
            })
        })
    })
    
})

.post(function(req,res){
    const requestedEmp=req.params.empId
    const company=req.body.company
    regEmployee.findOne({_id:requestedEmp},function(err,employee){
        const newEmployee = new Employee({
            name:employee.name,
            email:employee.email,
            phone:employee.phone,
            pin:employee.pin,
            education:employee.education,
            experience:employee.experience,
            city:employee.city,
            company:req.body.company,
            posting:req.body.posting,
            password:employee.password,
            resume:employee.resume,
            post:req.body.post

        })
        newEmployee.save(function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("employee added")
            }
        })
    })

    regEmployee.findOne({_id:requestedEmp},function(err,employee){
        Service.updateOne({firm:company},
            {
                $push:{
                    officeEmployees:{
                        name:employee.name,
                        phone:employee.phone,
                        email:employee.email,
                        pin:employee.pin,
                        city:employee.city
                    }
                }
            },
            {
                overwrite:true
            },
            function(err){
                if(err){
                    console.log(err)
                }
                else{
                    console.log("hogaya")
                }
            }
            )
    })
    regEmployee.remove({_id:requestedEmp},function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("deleted")
            res.redirect("/regEmployees")
        }
    })
})
    
app.get("/cv/:empId",function(req,res){
    requestedEmp=req.params.empId
    regEmployee.findOne({_id:requestedEmp},function(err,employee){
        res.render("cv",{
            resume:employee.resume
        })
    })
})


app.route("/docs/:serId")

.get(function(req,res){
    const requestedSer=req.params.serId
    regService.findOne({_id:requestedSer},function(err,service){
        res.render("document",{
            proofs:service.proofs,
        })
         
    })
})



.post(function(req,res){
    const requestedSer=req.params.serId
    regService.findOne({_id:requestedSer},function(err,service){
        const newService = new Service({
            email:service.email,
            name:service.name,
            phone:service.phone,
            password:service.password,
            pin:service.pin,
            address:service.address,
            gst:service.gst,
            state:service.state,
            city:service.city,
            firm:service.firm,
            number:service.number,
            proofs:service.proofs
    
        });
        newService.save(function(err){
            if(err){
                console.log(err)
            }
            else{
                
                console.log("done")
            }
        })
    })
    regService.deleteOne({_id:requestedSer},function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("deleted")
            res.redirect("/services")
        }
    })

    

})




app.get("/paymentSuccess",function(req,res){
    res.render("slotBooked",{

    })
})

// app.get("/subscription",function(req,res){
//     Coin.find({},function(err,coins){
//         res.render("subscription",{
//           stripePublicKey: stripePublicKey,
//           coins:coins  
//         })
//     })
// })

// app.get("/choose",function(req,res){
//     res.render("choose")
// })



app.route("/subscription/:userId")

.get(function(req,res){
    requestedUser=req.params.userId
    User.findOne({_id:requestedUser},function(err,user){
        Coin.find({},function(err,coins){
            res.render("subscription",{
                coins:coins,
                user:user
            })
        })
    })
    
   
})

// .post(function(req,res){
//     requestedUser=req.params.userId
//     User.updateOne({_id:requestedUser},{
//         $inc:{
//             coins:req.body.coinsRange        
//         }
        
//     },
//     {
//         overwrite:true
//     },
//         function (err) {
//             if(err){
//                 console.log(err)
//             }
//             else{
//                 console.log("updated")
//             }
            
//         }
    
//     )
//     var token=req.body.stripeToken;
//     let amount=req.body.chargeAmount;
//     var charge=stripe.charges.create({
//         charge:amount,
//         currency:"inr",
//         source:token,

//     },
//     function(err,charge){
//         if(err & err.type==="StripeCardError"){
//             console.log("Your card was declined")
//         }

//     }
//     )
//     console.log("Your payment was successful")
//     res.render("slotBooked")
// })

// app.post("/charge", async (req,res)=>{
//     try {
//         requestedUser=req.body.email
//         // try {
//         //     stripe.customers
//         //       .create({
//         //         name: req.body.name,
//         //         email: req.body.email,
//         //         source: req.body.stripeToken
//         //       })
//         //       .then(customer =>
//         //         stripe.charges.create({
//         //           amount: req.body.amount * 100,
//         //           currency: "inr",
//         //           customer: customer.id
//         //         })
//         //       )
//         //       .then(() => User.updateOne({email:requestedUser},{
//         //         $inc:{
//         //             coins:req.body.coinsRange        
//         //         }
                
//         //     },
//         //     {
//         //         overwrite:true
//         //     },
//         //         function (err) {
//         //             if(err){
//         //                 console.log(err)
//         //             }
//         //             else{
//         //                 console.log("updated")
//         //             }
                    
//         //         }
            
//         //     ))
//         //       .catch(err => console.log(err));
//         //   } catch (err) {
//         //     res.send(err);
//         //   }
        
        

//         var token=req.body.stripeToken;
//         var chargeAmount=req.body.amount * 100;
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: chargeAmount,
//             currency: 'inr',
//             // Verify your integration in this guide by including this parameter
//             metadata: {integration_check: 'accept_a_payment'},
//           });
//         const charge = await stripe.charges.create({
//             amount:chargeAmount,
//             currency:"inr",
//             source:token,
//         });

//         console.log("Your payment was successful")
//         await User.updateOne({email:requestedUser},{
//             $inc:{
//                 coins:req.body.coinsRange        
//             }
            
//         },
//         {
//             overwrite:true
//         });
        
//         console.log("Updated");
//         const user = await User.findOne({email:requestedUser});
//         res.render("slotBooked",{ user });
//     } catch (err) {
//         console.log(err)
//         console.log("Your card was declined")
//         User.findOne({email:requestedUser},function(err,user){
//             res.render("paymentFailed",{
//                 user:user
//             })
//         });
//     }
// })
// const user = await User.findOne({ email: userEmail }).lean();
//             res.render("bookingFailed", { user });
//             return;

// app.post("/charge", async (req,res)=>{
//     try{
        
//         const {id:id, userId:userId}=req.body
//         const coin= await Coin.findOne({_id:id}).lean();
//         const user=await User.findOne({_id:userId}).lean();
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: req.body.amount*10,
//             currency: 'inr',
//             // Verify your integration in this guide by including this parameter
//             metadata: {integration_check: 'accept_a_payment'},
//           });
//         res.render("checkout",{ coin,user,paymentIntent })
//     }
//     catch(err){
//         console.log(err)
//     }
// })

app.post("/cart",function (req,res){
    const{email:email,coinsRange:coinsRange}=req.body
    amount=req.body.amount
    
    User.updateOne({email:email},{
        $set:{
            cartCoins:coinsRange,
            cartAmount: amount
        }

    },function(err){
        if(err){
            res.redirect("/addCoins")
            console.log(err)
        }else{
            User.findOne({email:email},function(err,user){
                res.render("search",{user:user})
            })
           
        }
    })    
})


app.get("/cart/:userId/:cartAmount",function(req,res){
    User.findOne({_id:req.params.userId},function(err,user){
        res.render("cart",{user:user})
    })
})



app.post("/cart/:userId/:cartAmount", async (req, res) => {
    try{
        const user=User.findOne({_id:req.params.userId})
        console.log(typeof(user),isArray(user))
        var amount = user.cartAmount
        console.log("amount:",amount)
        const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "inr",
      })
    console.log(paymentIntent.client_secret)

    res.json({ clientSecret: paymentIntent.client_secret, publishableKey: 'pk_test_51Gs3hQJKmdeuOmy6Fb95zIULIl9ELcKhXBD5igPSmtZYlvu9naw4HqjAEhQY2inVarsRALNc57eLMApJvpCJfvvy00CLvkeIEr'})
   
}
catch(err){
    console.log(err)
} })


app.post("/add-coins",function(req,res){
    email=req.body.email,
    coins=req.body.cartCoins
    User.findOneAndUpdate({email:email},{
        $inc:{
            coins:coins
        }
    })
    res.json({email:email,coins:coins})
    
})



  






app.get("/slotBooked",function(req,res){
    res.render("slotBooked")
})


app.get("/serviceDashboard/:serviceId",function(req,res){
    id=req.params.serviceId
    Service.findOne({_id:id},function(err,service){
        res.render("serviceDashboard",{
            service:service
        })
    })
})

app.get("/employeeDashboard/:empId",function(req,res){
    id=req.params.empId
    Employee.findOne({_id:id},function(err,service){
        res.render("empDashboard",{
            employee:employee
        })
    })
})

app.get("/rates/:serviceId",function(req,res){
    serviceId=req.params.serviceId
    Service.findOne({_id:serviceId},function(err,service){
        res.render("rates",{
            service:service
        })
    })
})

app.route("/homeBooking/:stationName/:dateSlot/:timeSlot")

.get(function(req,res){
    var userEmail=req.body.yourEmail;
    var requiredName=req.params.stationName;
    var requiredDate=req.params.dateSlot;
    var requiredSlot=req.params.timeSlot;
    Service.findOne({name:requiredName},function(err,service){
        res.render("homeBooking",{
            service:service,
            slotTime:requiredSlot,
            slotDate:requiredDate
        })
    })

    
})

.post(upload.single('img'),async (req,res) => {
    try {
        const { model, yourEmail: userEmail } = req.body;
        const { stationName: requiredName } = req.params;

        const service = await Service.findOne({ name: requiredName }).lean();
        if (!service) {
            const user = await User.findOne({ email: userEmail }).lean();
            res.render("bookingFailed",{ user });
            return;
        }

        let usedCoins = "";

        switch (model) {
            case "Two Wheeler":
                usedCoins = service.homeTwoWheeler;
                break;
            case "Sedan":
                usedCoins = service.homeSedan;
                break;
            case "Hatchback":
                usedCoins = service.homeHatchback;
                break;
            case "Auto Rikshaw":
                usedCoins = service.homeAuto;
                break;
            case "small":
                usedCoins = service.homeSmall;
                break;
            case "SUV":
                usedCoins = service.homeSUV;
                break;
            case "Maxi":
                usedCoins = service.homeMaxi;
                break;
            case "Tempo":
                usedCoins = service.homeTempo;
                break;
            case "Bus":
                usedCoins = service.homeBus;
                break;
            case "Multi Axel":
                usedCoins = service.homeMulti;
                break;
            case "others":
                usedCoins = service.homeOthers;
                break;
            default:
                usedCoins = "Not Found";
        }

        if (usedCoins === "Not Found") {
            const user = await User.findOne({ email: userEmail }).lean();
            res.render("bookingFailed", { user });
            return;
        }

        const userExists = await User.findOneAndUpdate(
            { email: userEmail, coins: { $gte: usedCoins } },
            { $inc: { coins: -usedCoins } },
            { new: true, overwrite:true },
        );

        if (!userExists) {
            console.log(userExists);
            const user = await User.findOne({ email: userEmail }).lean();
            res.render("bookingFailed",{ user });
            return ;
        }

        // Guidlines
        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
        // 2. Use => keyword instead of function keyword. Refer ES6 changes
        // 3. Use async/await instead of callbacks.
        // 4. use proper linting (Refer airbnb guideline)

        // This is known as object destructuring

        // Good Practice
        const {
            detailsCity,
            detailsEmail,
            detailsName,
            detailsPhone,
            phone,
            userName
        } = req.body;

        const {
            dateSlot: requiredDate,
            timeSlot: requiredSlot,
        } = req.params;

        // Bad Practice
        // let userEmail = req.body.yourEmail
        // let requiredName = req.params.stationName
        // let requiredSlot = req.params.timeSlot;    
        // let requiredDate = req.params.dateSlot;

        // Use async/await instead of callback
        await User.updateOne({ email: userEmail }, {
            $push: {
                homeBookings: {
                    address: req.body.detailsAddress,
                    city: detailsCity,
                    coins: usedCoins,
                    date: requiredDate,
                    email: detailsEmail,
                    name: detailsName,
                    phone: detailsPhone,
                    slot: requiredSlot,
                }
            }
        });

        // This is known as object destructuring
        const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};

        homePendings.push({
            address: req.body.address,
            coins: usedCoins,
            date: requiredDate,
            email: userEmail,
            model: model,
            name: userName,
            phone: phone,
            slot: requiredSlot,
            userQR: req.file.key,
            vehicleNo: req.body.vehicleNo,
        });

        const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
        if (homeSlotIndex !== -1) {
            const { time = [] } = homeSlots[homeSlotIndex];
            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
            homeSlots[homeSlotIndex].time = [...updatedTime];
        }

        await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
        const user = await User.findOne({email:userEmail});
        
        res.render("bookingDone",{ user });
        console.log("done");
    } catch(err) {
        console.warn("Error in method: ", (err && err.message) || err);
        const { yourEmail: userEmail } = req.body;
        const user = await User.findOne({email: userEmail});
        res.render("bookingFailed",{ user });
    }
})

app.get("/verifiedServices",(req,res)=>{
    Service.find({},function(err,services){
        res.render("verifiedServices",{
            services:services
        })
    })
})


app.get("/documents/:serviceId",function(req,res){
    Service.findOne({_id:req.params.serviceId},function(err,service){
        res.render("document",{
            proofs:service.proofs
        })
    })
})


app.route("/officeBooking/:stationName/:dateSlot/:timeSlot")

.get(function(req,res){
    var userEmail=req.body.yourEmail;
    var requiredName=req.params.stationName;
    var requiredDate=req.params.dateSlot;
    var requiredSlot=req.params.timeSlot;
    Service.findOne({name:requiredName},function(err,service){
        res.render("officeBooking",{
            service:service,
            slotTime:requiredSlot,
            slotDate:requiredDate
        })
    })

    
})

.post(upload.single('img'),async (req,res) => {
    try {
        const { model, yourEmail: userEmail } = req.body;
        const { stationName: requiredName } = req.params;

        const service = await Service.findOne({ name: requiredName }).lean();
        if (!service) {
            const user = await User.findOne({ email: userEmail }).lean();
            res.render("bookingFailed",{ user });
            return;
        }

        let usedCoins = "";

        switch (model) {
            case "Two Wheeler":
                usedCoins = service.officeTwoWheeler;
                break;
            case "Sedan":
                usedCoins = service.officeSedan;
                break;
            case "Hatchback":
                usedCoins = service.officeHatchback;
                break;
            case "Auto Rikshaw":
                usedCoins = service.officeAuto;
                break;
            case "small":
                usedCoins = service.officeSmall;
                break;
            case "SUV":
                usedCoins = service.officeSUV;
                break;
            case "Maxi":
                usedCoins = service.officeMaxi;
                break;
            case "Tempo":
                usedCoins = service.officeTempo;
                break;
            case "Bus":
                usedCoins = service.officeBus;
                break;
            case "Multi Axel":
                usedCoins = service.officeMulti;
                break;
            case "others":
                usedCoins = service.officeOthers;
                break;
            default:
                usedCoins = "Not Found";
        }

        if (usedCoins === "Not Found") {
            const user = await User.findOne({ email: userEmail }).lean();
            res.render("bookingFailed", { user });
            return;
        }

        const userExists = await User.findOneAndUpdate(
            { email: userEmail, coins: { $gte: usedCoins } },
            { $inc: { coins: -usedCoins } },
            { new: true, overwrite:true },
        );

        if (!userExists) {
            console.log(userExists);
            const user = await User.findOne({ email: userEmail }).lean();
            res.render("bookingFailed",{ user });
            return ;
        }

        // Guidlines
        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
        // 2. Use => keyword instead of function keyword. Refer ES6 changes
        // 3. Use async/await instead of callbacks.
        // 4. use proper linting (Refer airbnb guideline)

        // This is known as object destructuring

        // Good Practice
        const {
            detailsCity,
            detailsEmail,
            detailsName,
            detailsPhone,
            phone,
            userName
        } = req.body;

        const {
            dateSlot: requiredDate,
            timeSlot: requiredSlot,
        } = req.params;

        // Bad Practice
        // let userEmail = req.body.yourEmail
        // let requiredName = req.params.stationName
        // let requiredSlot = req.params.timeSlot;    
        // let requiredDate = req.params.dateSlot;

        // Use async/await instead of callback
        await User.updateOne({ email: userEmail }, {
            $push: {
                officeBookings: {
                    address: req.body.detailsAddress,
                    city: detailsCity,
                    coins: usedCoins,
                    date: requiredDate,
                    email: detailsEmail,
                    name: detailsName,
                    phone: detailsPhone,
                    slot: requiredSlot,
                }
            }
        });

        // This is known as object destructuring
        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};

        officePendings.push({
            address: req.body.address,
            coins: usedCoins,
            date: requiredDate,
            email: userEmail,
            model: model,
            name: userName,
            phone: phone,
            slot: requiredSlot,
            userQR: req.file.key,
            vehicleNo: req.body.vehicleNo,
        });

        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
        if (officeSlotIndex !== -1) {
            const { time = [] } = officeSlots[officeSlotIndex];
            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
            officeSlots[officeSlotIndex].time = [...updatedTime];
        }

        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
        const user = await User.findOne({email:userEmail});
        
        res.render("bookingDone",{ user });
        console.log("done");
    } catch(err) {
        console.warn("Error in method: ", (err && err.message) || err);
        const { yourEmail: userEmail } = req.body;
        const user = await User.findOne({email: userEmail});
        res.render("bookingFailed",{ user });
    }
    
    
})

app.get("/completedEmployee/:empId",function(req,res){
    Employee.findOne({_id:req.params.empId},function(err,employee){
        res.render("completedEmployee",{
            employee:employee
        })
    })
})



app.get("/completedUser/:userId",function(req,res){
    User.findOne({_id:req.params.userId},function(err,user){
        res.render("completedUser",{
            user:user
        })
    })
})

app.get("/completedService/:serviceId",function(req,res){
    Service.findOne({_id:req.params.serviceId},function(err,service){
        res.render("completedService",{
            service:service
        })
    })
})


app.get("/homeEmployees/:serviceId",function(req,res){
    Service.findOne({_id:req.params.serviceId},function(err,service){
        res.render("homeEmployees",{
            service:service
        })
    })
})

app.get("/officeEmployees/:serviceId",function(req,res){
    Service.findOne({_id:req.params.serviceId},function(err,service){
        res.render("officeEmployees",{
            service:service
        })
    })
})

app.get("/userDashboard/:userId",function(req,res){
    requestedUser=req.params.userId
    User.findOne({_id:requestedUser},function(err,user){
        res.render("userDashboard",{
            
            user:user
        })
    })
    
})



app.get("/userlogin",function(req,res){
    res.render("userLogin")
})

app.post("/userLogin",function(req,res){
    const email=req.body.email
    const password=req.body.password
    User.findOne({email:email},function(err,foundUser){
        if(err){
            console.log(err)
        }
        else{
            if (foundUser){
                if(foundUser.password === password){
                    res.render("search",{
                        user:foundUser

                    })
                }
            }
        }
    })
    
})

app.get("/emplogin",function(req,res){
    res.render("empLogin")
})

app.post("/empLogin",function(req,res){
    const email=req.body.email
    const password=req.body.password
    Employee.findOne({email:email},function(err,foundEmployee){
        if(err){
            console.log(err)
        }
        else{
            if (foundEmployee){
                if(foundEmployee.password === password){
                    res.render("empDashboard",{
                        employee:foundEmployee
                    })
                }
                
            }
        }
    })
    
})

app.get("/serviceSlots/:id",function(req,res){
    Service.findOne({_id:req.params.id},function(err,service){
        res.render("serviceSlots",{
            service:service
        
        })
    })
})



app.route("/pendings/:empId")

.get( function(req,res){
    requestedEmployee=req.params.empId
    Employee.findOne({_id:requestedEmployee},function(err,employee){
        res.render("pendings",{
            employee:employee
        })
    })
})
// completedWork:[{date:String,startTime:String,endTime:String,phone:String,customer:String}]

.post(upload.array("files",2),async (req,res)=>{
        const{email:email,id:id,empid:empid,model:model,name:name,coins:coins,phone:phone,slot:slot,date:date,vehicleNo:vehicleNo,startTime:startTime,endTime:endTime,serviceName:serviceName,location:location}=req.body
        // await User.findOneAndUpdate({email:email},{
            
        // },{
        //     upsert:true,
        //     new:true
        // },function(err){
        //     if(err){
        //         console.log(err)
        //     }
        // })
        if(location==="Home"){
            await User.updateOne({email:email},{
                $push:{
                    completed:{
                        name:serviceName,
                        startTime:startTime,
                        endTime:endTime,
                        date:date,
                        location:location,
                        coins:coins
                    }
        
                },
                $set:{
                    lastDate:date,
                    lastStartTime:startTime,
                    lastEndTime:endTime,
                    lastImages:req.files
                },
                $pull:{
                    homeBookings:{
                        slot:slot
                    }
                }
                
            },{
                overwrite:false,
                multi:false,
                new:true,
                upsert:true
            },function(err){
                if(err){
                    console.log(err)
                }
            })
        await Service.updateOne({firm:serviceName},{
            $push:{
                completedBookings:{
                    date:date,
                    startTime:startTime,
                    endTime:endTime,
                    vehicleNo:vehicleNo,
                    customer:name,
                    location:location,
                    coins:coins,
                    model:model
    
                }
    
            },
            $pull:{
                homePendings:{
                    slot:slot
                }
            }
            
        })
        await Employee.updateOne({_id:id},{
            $push:{
                completedWork:{
                    customer:name,
                    phone:phone,
                    startTime:startTime,
                    endTime:endTime,
                    date:date,
                    coins:coins
                    
                }
            },
            $pull:{
                pendings:{
                    _id:empid
                }
            } 
         })
         Employee.findOne({_id:id},function(err,employee){
            res.render("pendings",{ employee:employee })
         })
        }else if(location==="On Site"){
            await User.updateOne({email:email},{
                $push:{
                    completed:{
                        name:serviceName,
                        startTime:startTime,
                        endTime:endTime,
                        date:date,
                        location:location,
                        coins:coins
                    }
        
                },
                $set:{
                    lastDate:date,
                    lastStartTime:startTime,
                    lastEndTime:endTime,
                    lastImages:req.files
                },
                $pull:{
                    officeBookings:{
                        slot:slot
                    }
                }
                
            },{
                overwrite:true
            })
        await Service.updateOne({firm:serviceName},{
            $push:{
                completedBookings:{
                    date:date,
                    startTime:startTime,
                    endTime:endTime,
                    vehicleNo:vehicleNo,
                    customer:name,
                    location:location,
                    coins:coins,
                    model:model
    
                }
    
            },
            $pull:{
                officePendings:{
                    slot:slot
                }
            }
            
        })
        await Employee.updateOne({_id:id},{
            $push:{
                completedWork:{
                    customer:name,
                    phone:phone,
                    startTime:startTime,
                    endTime:endTime,
                    date:date,
                    coins:coins
                    
                }
            },
            $pull:{
                pendings:{
                    _id:empid
                }
            } 
         })
         Employee.findOne({_id:id},function(err,employee){
            res.render("pendings",{ employee:employee })
         })
        
        }
        
    
}
)

app.get("/empDashboard/:empId",function(req,res){
    Employee.findOne({_id:req.params.empId},function(err,employee){

        res.render("empDashboard",{
            employee:employee
        })
    })
})

app.get("/lastDetails/:userId",function(req,res){
    User.findOne({_id:req.params.userId},function(err,user){
        res.render("lastDetails",{
            user:user
        })
    })
})


app.get("/servicelogin",function(req,res){
    res.render("serviceLogin")
})

app.route("/homeUpcomingBookings/:serviceId")

.get(function(req,res){
    requestedService=req.params.serviceId
    Service.findOne({_id:requestedService},function(err,service){
        res.render("upcomingBookings",{
            service:service
        })
    })
})

.post(function(req,res){
    requestedService=req.params.serviceId,
    employee=req.body.employee
    Employee.findOneAndUpdate({name:req.body.employee},{
        $push:{
            pendings:{
                name:req.body.name,
                phone:req.body.phone,
                email:req.body.email,
                slot:req.body.slot,
                date:req.body.date,
                vehicleNo:req.body.vehicleNo,
                address:req.body.address,
                coins:req.body.coins,
                model:req.body.model
            }
        }
        
    },
    {
        overwrite:true
    },
    function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("done")
            Service.findOne({_id:requestedService},function(err,service){
                res.render("upcomingBookings",{
                    service:service
                })
            })
        }
    }
    )
})







app.route("/officeUpcomingBookings/:serviceId")

.get(function(req,res){
    requestedService=req.params.serviceId
    Service.findOne({_id:requestedService},function(err,service){
        res.render("officeUpcomingBookings",{
            service:service
        })
    })
})

.post(function(req,res){
    requestedService=req.params.serviceId,
    employee=req.body.employee
    Employee.findOneAndUpdate({name:req.body.employee},{
        $push:{
            pendings:{
                name:req.body.name,
                phone:req.body.phone,
                email:req.body.email,
                slot:req.body.slot,
                date:req.body.date,
                vehicleNo:req.body.vehicleNo,
                coins:req.body.coins
            }
        }
        
    },
    {
        overwrite:true
    },
    function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("done")
            Service.findOne({_id:requestedService},function(err,service){
                res.render("officeUpcomingBookings",{
                    service:service
                })
            })
        }
    }
    )
})


app.post("/serviceLogin",function(req,res){
    const email=req.body.email
    const password=req.body.password
    Service.findOne({email:email},function(err,foundService){
        if(err){
            console.log(err)
        }
        else{
            if (foundService){
                if(foundService.password === password){
                    res.render("serviceDashboard",{
                        service:foundService

                    })
                }
            }
        }
    })
    
})

app.get("/search/:userId",function(req,res){
    requestedUser=req.params.userId
    User.findOne({_id:requestedUser},function(err,foundUser){
        res.render("search",{
            user:foundUser
        })
    })
})

app.post("/search",function(req,res){
    
    const enteredPin= req.body.pin
    Service.find({pin:enteredPin},function(err,stations){
           if (err){
            console.log(err)
        }
        else{
        res.render("result",{
            stations:stations})
    }
    })
})

app.post("/citySearch",function(req,res){
    var enteredCity=req.body.city
    var searchCity=enteredCity.charAt(0).toUpperCase()+enteredCity.slice(1)
    Service.find({city:searchCity},function(err,stations){
        if(err){
            console.log(err)
        }
        else{
            res.render("result",{
                stations:stations
            })
        }
    })
})



app.get("/coins",function(req,res){
    res.render("addCoins")
})

app.post("/addCoins",function(req,res){
    const newCoin=new Coin({
            range:req.body.range,
            price:req.body.price

        
    })
    newCoin.save(function(err){
        if(err){
            console.log(err)
        }
        else{
            res.render("addCoins")
        }
    })
})


app.post("/register",upload.single('img'),async (req,res) => {
    try {
        await User.create({
            email:req.body.username,
            name:req.body.name,
            phone:req.body.phone,
            password:req.body.password,
            vehicleType:req.body.vehicleType,
            vehicleCompany:req.body.company,
            model:req.body.model,
            number:req.body.vehicleNo,
            year:req.body.passingYear,
            address:req.body.address,
            profile:req.file.key
        });
        res.render("userLogin");
    } catch (err) {
        console.log(err);
    }
})

app.get("/view/:name",function(req,res){
    requestedImage=req.params.name
    res.render("image",{
        img:requestedImage
    })
})


app.get("/empreg",function(req,res){
    res.render("employeeReg")
})

app.post("/removeCoin",function(req,res){
    Coin.remove({_id:req.body.id},function(err){
        if(err){
            console.log(err)
            res.redirect("/addedCoins")
        }else{
            res.redirect("/addedCoins")
        }
    })
})

app.post("/empreg", upload.array("files",10) , async (req,res) => {
    try {
        const { city = "" } = req.body;
        const regCity = city.charAt(0).toUpperCase() + city.slice(1);
        await regEmployee.create({
            email:req.body.username,
            name:req.body.name,
            phone:req.body.phone,
            password:req.body.password,
            pin:req.body.pin,
            education:req.body.education,
            experience:req.body.experience,
            city:regCity,
            resume:req.files    

        });
        res.render("thankyou");
    } catch (err) {
        console.log(err);
    }
})

app.post("/reg",upload.array("files",100),async (req,res) => {
    try {
        const { city = "" } = req.body;
        const regCity = city.charAt(0).toUpperCase() + city.slice(1);
        await regService.create({
            email:req.body.username,
            name:req.body.name,
            phone:req.body.phone,
            password:req.body.password,
            pin:req.body.pin,
            address:req.body.address,
            gst:req.body.gst,
            state:req.body.state,
            city:regCity,
            firm:req.body.firm,
            number:req.body.number,
            proofs:req.files
        });
        res.render("thankyou");
    } catch (err) {
        console.log(err);
    }
})

app.route("/proof")

.get(function(req,res){
    res.render("proof")
        
    
})

.post( upload.array("files",60),function(req,res,next){
    requestedProof=req.body.email
    regService.updateOne({email:requestedProof},{
        $push:{
            proofs:req.files
            
        },
    },
    {
        overwrite:true
    },
    function(err){
        if(!err){
            res.render("thankyou")
        }
        else{
            console.log(err)
        }
    })
        
        
    })
    
// proofs:req.files.filename,











const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));















// app.get("/service/slots/:time",function(req,res){
//     const requestedService=req.params.time;
//     Service.findOne({slots:{$elemMatch:requestedService}},function(err,service){
//         res.render("slot")
//     })
// })