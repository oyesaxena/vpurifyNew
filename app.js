//jshint esversion:6

const express =require("express");
const ejs = require("ejs");
const path = require("path");
const fs = require('fs')
var stripe=require("stripe")("sk_live_atnMmoIIIo6GVZbkcqLqdyNz00Xddhc0Fl")
const bodyParser = require("body-parser");
const mongoose=require("mongoose")
const app=express();
const _ = require("lodash");
var __ = require('lodash/core');
var fp = require('lodash/fp');
var array = require('lodash/array');
var object = require('lodash/fp/object');
var at = require('lodash/at');
var curryN = require('lodash/fp/curryN');
const encrypt=require("mongoose-encryption");
var QRCode      =   require('qrcode');
var multer  = require('multer')
multerS3 = require('multer-s3')
aws = require('aws-sdk')


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect('mongodb+srv://vpurify:vpurify@vpurify-267xm.mongodb.net/vpurify?retryWrites=true&w=majority/vpurifyDB',{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:true });

aws.config.update({
    secretAccessKey: 'W1XlSdF0UC3cvmpS10Tc1z/2RcdnBMiwfk+aY4zJ',
    accessKeyId: 'AKIAWKOAX5BSNGPH7DWP',
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
    homeBookings:[{name:{type:String,trim:true},email:{type:String,trim:true},phone:{type:String,trim:true},address:{type:String,trim:true},city:{type:String,trim:true},slot:{type:String,trim:true},date:{type:String,trim:true},coins:Number}],
    officeBookings:[{name:{type:String,trim:true},email:{type:String,trim:true},phone:{type:String,trim:true},address:{type:String,trim:true},city:{type:String,trim:true},slot:{type:String,trim:true},date:{type:String,trim:true},coins:Number}],
    completed:[{date:{type:String,trim:true},startTime:{type:String,trim:true},endTime:{type:String,trim:true},pics:[],name:{type:String,trim:true},location:{type:String,trim:true},coins:Number}],
    lastDate:{type:String,trim:true,default:" "},lastStartTime:{type:String,trim:true,default:" "},lastEndTime:{type:String,trim:true,default:" "},lastFrontImage:String,lastBackImage:String
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
    homePendings:[{name:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},slot:{type:String,trim:true},vehicleNo:{type:String,trim:true},date:{type:String,trim:true},userQR:{type:String,trim:true},address:{type:String,trim:true},model:{type:String},coins:Number}],
    officePendings:[{name:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},slot:{type:String,trim:true},vehicleNo:{type:String,trim:true},date:{type:String,trim:true},userQR:{type:String,trim:true},model:{type:String},coins:Number}],
    homeEmployees:[{name:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},pin:{type:String,trim:true},city:{type:String,trim:true}}],
    officeEmployees:[{name:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},pin:{type:String,trim:true},city:{type:String,trim:true}}],
    completedBookings:[{date:{type:String,trim:true},startTime:{type:String,trim:true},endTime:{type:String,trim:true},vehicleNo:{type:String,trim:true},customer:{type:String,trim:true},location:{type:String,trim:true},coins:Number}],
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
    pendings:[{name:{type:String,trim:true},address:{type:String,trim:true},phone:{type:String,trim:true},email:{type:String,trim:true},slot:{type:String,trim:true},vehicleNo:{type:String,trim:true},model:{type:String},date:{type:String,trim:true},coins:Number}],
    completedWork:[{date:{type:String,trim:true},startTime:{type:String,trim:true},endTime:{type:String,trim:true},phone:{type:String,trim:true},customer:{type:String,trim:true}}],post:{type:String,trim:true}

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

app.post("/charge",(req,res)=>{
    
    requestedUser=req.body.email
    // try {
    //     stripe.customers
    //       .create({
    //         name: req.body.name,
    //         email: req.body.email,
    //         source: req.body.stripeToken
    //       })
    //       .then(customer =>
    //         stripe.charges.create({
    //           amount: req.body.amount * 100,
    //           currency: "inr",
    //           customer: customer.id
    //         })
    //       )
    //       .then(() => User.updateOne({email:requestedUser},{
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
        
    //     ))
    //       .catch(err => console.log(err));
    //   } catch (err) {
    //     res.send(err);
    //   }
    
    

    var token=req.body.stripeToken;
    var chargeAmount=req.body.amount * 100;
    var charge=stripe.charges.create({
        amount:chargeAmount,
        currency:"inr",
        source:token,

    },
    function(err,charge){
        if(err){
            console.log(err)
            console.log("Your card was declined")
            User.findOne({email:requestedUser},function(err,user){
                res.render("paymentFailed",{
                    user:user
                })
            })
        }else{
            console.log("Your payment was successful")
            User.updateOne({email:requestedUser},{
                $inc:{
                    coins:req.body.coinsRange        
                }
                
            },
            {
                overwrite:true
            },
                function (err) {
                    if(err){
                        console.log(err)
                    }
                    else{
                        console.log("updated")
                        User.findOne({email:requestedUser},function(err,user){
                            res.render("slotBooked",{
                                user:user
                            })
                        })
                    }
                    
                }
            
            )
   
        }

    }
   );
    
    


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
    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
    
    if(model=="Two Wheeler"){
        Service.findOne({name:requiredName}, (err,service)=>{
            User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeTwoWheeler)}},{
               $inc:{
                   coins:-(service.homeTwoWheeler)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(docs)
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }
               else if(docs==null){
                   console.log(docs)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }
               else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeTwoWheeler
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeTwoWheeler,
                        model:model,
                        address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                    console.log("done");
                    
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           }

           )
       })
   }else if(model=="Sedan"){
        Service.findOne({name:requiredName}, (err,service)=>{
            User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeSedan)}},{
               $inc:{
                   coins:-(service.homeSedan)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }
               else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeSedan
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeSedan,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                    
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           }
           )
       })

   }else if(model=="Hatchback"){
        Service.findOne({name:requiredName}, (err,service)=>{
            User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeHatchback)}},{
               $inc:{
                   coins:-(service.homeHatchback)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   console.log(docs)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeHatchback
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeHatchback,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           })
       })

   }else if(model=="Auto Rikshaw"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeAuto)}},{
               $inc:{
                   coins:-(service.homeAuto)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   console,log(docs)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }
               else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeAuto
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeAuto,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           })
       })

   }else if(model=="small"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeSmall)}},{
               $inc:{
                   coins:-(service.homeSmall)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeSmall
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeSmall,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                 await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           })
       })

   }else if(model=="SUV"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeSUV)}},{
               $inc:{
                   coins:-(service.homeSUV)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeSUV
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeSUV,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
                   
               }
           })
       })

   }else if(model=="Maxi"){
       Service.findOne({name:requiredName},(err,service)=>{
           User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeMaxi)}},{
               $inc:{
                   coins:-(service.homeMaxi)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeMaxi
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeMaxi,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           })
       })

   }else if(model=="Tempo"){
      Service.findOne({name:requiredName}, (err,service)=>{
           User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeTempo)}},{
               $inc:{
                   coins:-(service.homeTempo)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeTempo
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeTempo,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           })
       })

   }else if(model=="Bus"){
       Service.findOne({name:requiredName},  (err,service)=>{
           User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeBus)}},{
               $inc:{
                   coins:-(service.homeBus)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeBus
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeBus,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           })
       })

   }else if(model=="Multi Axel"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeMulti)}},{
               $inc:{
                   coins:-(service.homeMulti)
               }
           },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeMulti
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeMulti,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }
               }
           })
       })

   }else if(model=="others"){
        Service.findOne({name:requiredName}, (err,service)=>{
            User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.homeOthers)}},{
                $inc:{
                    coins:-(service.homeOthers)
                }
            },{
               overwrite:true
           },
           async function(err,docs){
               if(err){
                   console.log(err)
                   await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
               }else if(docs==null){
                console.log(docs)
                await User.findOne({email:userEmail},function(err,user){
                    res.render("bookingFailed",{user:user})
                })
            }else{
                   console.log("coin removed")
                   try {

                    // Guidlines
                    // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                    // 2. Use => keyword instead of function keyword. Refer ES6 changes
                    // 3. Use async/await instead of callbacks.
                    // 4. use proper linting (Refer airbnb guideline)
            
                    // This is known as object destructuring
            
                    // Good Practice
                    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
                    const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
            
                    // Bad Practice
                    // let userEmail = req.body.yourEmail
                    // let requiredName = req.params.stationName
                    // let requiredSlot = req.params.timeSlot;    
                    // let requiredDate = req.params.dateSlot;
            
                    // Use async/await instead of callback
                    await User.updateOne({ email: userEmail }, {
                        $push: {
                            homeBookings: {name:detailsName,
                                           city:detailsCity,
                                           email:detailsEmail,
                                           phone:detailsPhone,
                                           slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.homeOthers
                            }
                        }
                    });
            
                    
                    
            
                    // This is known as object destructuring
                    const { homeSlots = [], homePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
            
                    homePendings.push({
                        name: userName,
                        email: userEmail,
                        phone: phone,
                        vehicleNo:req.body.vehicleNo,
                        slot: requiredSlot,
                        date:requiredDate,
                        userQR:req.file.key,
                        coins:service.homeOthers,model:model,address:req.body.address
                    });
            
                    const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
                    if (homeSlotIndex !== -1) {
                        const { time = [] } = homeSlots[homeSlotIndex];
                        const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                        homeSlots[homeSlotIndex].time = [...updatedTime];
                    }
            
                    await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });
            
                    console.log("done");
                    await User.findOne({email:userEmail},async function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            res.render("bookingDone",{user:user})
                        }
                    } )
                } catch(err) {
                    console.warn("Error in method: ", (err && err.message) || err);
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })                }
               }
           })
        })

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
    const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity,model } = req.body;
        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
        if(model=="Two Wheeler"){
            Service.findOne({name:requiredName}, (err,service)=>{
                User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeTwoWheeler)}},{
                   $inc:{
                       coins:-(service.officeTwoWheeler)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                           res.render("bookingFailed",{user:user})
                       })
                   }else if(docs==null){
                       console.log("operation failed")
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }
                   else{
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                               date:requiredDate,
                                               address:req.body.detailsAddress,
                                               coins:service.officeTwoWheeler
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeTwoWheeler,model:model

                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               }
    
               )
           })
       }else if(model=="Sedan"){
            Service.findOne({name:requiredName}, (err,service)=>{
                User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeSedan)}},{
                   $inc:{
                       coins:-(service.officeSedan)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeSedan
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeSedan,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               }
               )
           })
    
       }else if(model=="Hatchback"){
            Service.findOne({name:requiredName}, (err,service)=>{
                User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeHatchback)}},{
                   $inc:{
                       coins:-(service.officeHatchback)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeHatchback
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeHatchback,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="Auto Rikshaw"){
           Service.findOne({name:requiredName}, (err,service)=>{
               User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeAuto)}},{
                   $inc:{
                       coins:-(service.officeAuto)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeAuto
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeAuto,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="small"){
           Service.findOne({name:requiredName}, (err,service)=>{
               User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeSmall)}},{
                   $inc:{
                       coins:-(service.officeSmall)
                   }
               },{
                   overwrite:true
               },
              async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeSmall
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeSmall,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="SUV"){
           Service.findOne({name:requiredName}, (err,service)=>{
               User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeSUV)}},{
                   $inc:{
                       coins:-(service.officeSUV)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeSUV
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeSUV,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="Maxi"){
           Service.findOne({name:requiredName},(err,service)=>{
               User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeMaxi)}},{
                   $inc:{
                       coins:-(service.officeMaxi)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    res.render("bookingFailed");
                }else{
                       
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeMaxi
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeMaxi,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="Tempo"){
          Service.findOne({name:requiredName}, (err,service)=>{
               User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeTempo)}},{
                   $inc:{
                       coins:-(service.officeTempo)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeTempo
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeTempo,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="Bus"){
           Service.findOne({name:requiredName},  (err,service)=>{
               User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeBus)}},{  
                   $inc:{
                       coins:-(service.officeBus)
                   }
               },{
                   overwrite:true
               },
              async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeBus
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeBus,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="Multi Axel"){
           Service.findOne({name:requiredName}, (err,service)=>{
               User.findOneAndUpdate({email:userEmail,coins:{$gt:(service.officeMulti)}},{
                   $inc:{
                       coins:-(service.officeMulti)
                   }
               },{
                   overwrite:true
               },
               async function(err,docs){
                   if(err){
                       console.log(err)
                       console.log(docs)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeMulti
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeMulti,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
           })
    
       }else if(model=="others"){
            Service.findOne({name:requiredName}, (err,service)=>{
                User.findOneAndUpdate({email:userEmail,coins:{$gte:(service.officeOthers)}},{
                    $inc:{
                        coins:-(service.officeOthers)
                    }
                },{
                   overwrite:true
               },
              async function(err,docs){
                   if(err){
                       console.log(docs)
                       console.log(err)
                       await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                   }else if(docs==null){
                    console.log("operation failed")
                    await User.findOne({email:userEmail},function(err,user){
                        res.render("bookingFailed",{user:user})
                    })
                }else{
                       
                       console.log("coin removed")
                       try {

                        // Guidlines
                        // 1. Use let/const instead of var, var uses global scope instead of functional scope.
                        // 2. Use => keyword instead of function keyword. Refer ES6 changes
                        // 3. Use async/await instead of callbacks.
                        // 4. use proper linting (Refer airbnb guideline)
                
                        // This is known as object destructuring
                
                        // Good Practice
                        const { userName, yourEmail: userEmail, detailsName, phone, detailsPhone, detailsEmail ,detailsCity } = req.body;
                        const { stationName: requiredName, timeSlot: requiredSlot, dateSlot: requiredDate } = req.params;
                        
                        // Bad Practice
                        // let userEmail = req.body.yourEmail
                        // let requiredName = req.params.stationName
                        // let requiredSlot = req.params.timeSlot;    
                        // let requiredDate = req.params.dateSlot;
                
                        // Use async/await instead of callback
                        await User.updateOne({ email: userEmail }, {
                            $push: {
                                officeBookings: {name:detailsName,
                                               city:detailsCity,
                                               email:detailsEmail,
                                               phone:detailsPhone,
                                               slot:requiredSlot,
                                           date:requiredDate,
                                           address:req.body.detailsAddress,
                                           coins:service.officeOthers
                                }
                            }
                        });
                
                        // This is known as object destructuring
                        const { officeSlots = [], officePendings = [] } = await Service.findOne({ name: requiredName }).lean() || {};
                
                        officePendings.push({
                            name: userName,
                            email: userEmail,
                            phone: phone,
                            vehicleNo:req.body.vehicleNo,
                            slot: requiredSlot,
                            date:requiredDate,
                            userQR:req.file.key,
                            coins:service.officeOthers,model:model
                        });
                
                        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
                        if (officeSlotIndex !== -1) {
                            const { time = [] } = officeSlots[officeSlotIndex];
                            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
                            officeSlots[officeSlotIndex].time = [...updatedTime];
                        }
                
                        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });
                
                        console.log("done");
                        await User.findOne({email:userEmail},async function(err,user){
                            if(err){
                                console.log(err)
                            }else{
                                res.render("bookingDone",{user:user})
                            }
                        } )
                    } catch(err) {
                        console.warn("Error in method: ", (err && err.message) || err);
                        await User.findOne({email:userEmail},function(err,user){
                            res.render("bookingFailed",{user:user})
                        })
                    }
                   }
               })
            })
    
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

.post(upload.fields([{name:"front",maxCount:1},{name:"back",maxCount:1}]),async (req,res)=>{
    
    Employee.findOneAndUpdate({_id:req.body.id},{
       $push:{
           completedWork:{
               customer:req.body.name,
               phone:req.body.phone,
               startTime:req.body.startTime,
               endTime:req.body.endTime,
               date:req.body.date,
               
           }
       },
       $pull:{
           pendings:{
               _id:req.body._id
           }
       } 
    },
    {
        overwrite:false,
        multi:true
    },
    function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("work done")
            
        }
    }
    )
    if(req.body.location=="Home"){
        User.findOneAndUpdate({email:req.body.email},{
            $pull:{
                homeBookings:{
                    slot:req.body.slot
                }
            }
        },{
            overwrite:true,
            multi:true
        },
        function (err,docs) {
            if(err){
                console.log(err)
            }else if(docs==null){
                console.log(docs)
            }else{
                console.log("ok")
                Service.findOneAndUpdate({firm:req.body.serviceName},{
                    $pull:{
                        homePendings:{
                            slot:req.body.slot
                        }
                    }
                },{
                    overwrite:true
                },function(err){
                    if(err){
                        console.log(err)
                    }else{
                        Employee.findOne({_id:req.body.id},function(err,employee){
                            res.render("pendings",{
                                employee:employee
                            })
                        })
                        
                    }
                })
            }
            
        }
        )
    }else if(req.body.location=="On Site"){
        User.findOneAndUpdate({email:req.body.email},{
            $pull:{
                officeBookings:{
                    slot:req.body.slot
                }
            }
        },{
            overwrite:true,
            multi:true
        },
        function (err,docs) {
            if(err){
                console.log(err)
            }else if(docs==null){
                console.log(docs)
            }else{
                Service.findOneAndUpdate({firm:req.body.serviceName},{
                    $pull:{
                        officePendings:{
                            slot:req.body.slot
                        }
                    }
                },{
                    overwrite:true
                },function(err){
                    if(err){
                        console.log(err)
                    }else{
                        Employee.findOne({_id:req.body.id},function(err,employee){
                            res.render("pendings",{
                                employee:employee
                            })
                        })
                        
                    }
                })
            }
            
        }
        )
    }
    


    User.findOneAndUpdate({email:req.body.email},{
        $push:{
            completed:{
                name:req.body.serviceName,
                startTime:req.body.startTime,
                endTime:req.body.endTime,
                date:req.body.date,
                location:req.body.location,
                pics:req.files,
                coins:req.body.coins
            }

        },
        $set:{
            lastDate:req.body.date,
            lastStartTime:req.body.startTime,
            lastEndTime:req.body.endTime,
            lastFrontImage:req.front.key,
            lastBackImage:req.back.key
        }
        
    },
    {
        overwrite:false,
        multi:true
    },
    function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("done")
        }
    }
    
    
    )

    Service.findOneAndUpdate({firm:req.body.serviceName},{
        $push:{
            completedBookings:{
                date:req.body.date,
                startTime:req.body.startTime,
                endTime:req.body.endTime,
                vehicleNo:req.body.vehicleNo,
                customer:req.body.name,
                location:req.body.location,
                coins:req.body.coins

            }

        },
        
    },{
        overwrite:false,
        multi:true
    },
    function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("done Work")
            Employee.findOne({_id:req.body.id},function(err,employee){
                res.render("pendings",{
                    employee:employee
                })
            })
        }
    }
    
    )


})

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
    
    var enteredPin= req.body.pin
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


app.post("/register",upload.single('img'),function(req,res){
    const newUser = new User({
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
    newUser.save(function(err){
        if (err) {
            console.log(err)

        }
        else{
            res.render("userLogin")
        }
    })
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

app.post("/empreg", upload.array("files",10) ,function(req,res){
    city=req.body.city
    regCity=city.charAt(0).toUpperCase()+city.slice(1)
    const newRegEmployee = new regEmployee({
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
    newRegEmployee.save(function(err){
        if (err) {
            console.log(err)

        }
        else{
            res.render("thankyou")
        }
        
    })
})


app.post("/reg",function(req,res){
    city=req.body.city
    regCity=city.charAt(0).toUpperCase()+city.slice(1)
    const newRegService = new regService({
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
        

    });
    newRegService.save(function(err){
        if (err) {
            console.log(err)

        }
        else{
            res.redirect("/proof")
        }
    })
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