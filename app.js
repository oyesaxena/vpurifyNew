//jshint esversion:6

const express =require("express");
const ejs = require("ejs");
const path = require("path");
const fs = require('fs')
var stripe=require("stripe")("sk_test_cVqm5dM8e46TWlOxFqt6oCY4000N87a6tI")
const bodyParser = require("body-parser");
const mongoose=require("mongoose")
var messagebird = require('messagebird')('lSeG8d2NuTn9IinXE6aKsn1Te');
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


mongoose.connect('mongodb://localhost:27017/vpurifyDB',{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:true });

aws.config.update({
    secretAccessKey: '1J7MMS5kVxX+EOgHEZcfhHZAeeM/BMJC+MhYxkEP',
    accessKeyId: 'AKIAWKOAX5BSAYMBYWII',
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
    email: String,
    name:String,
    password:String ,
    phone:String,
    profile:String,
    adress:String,
    vehicleType:String,
    vehicleCompany:String,
    model:String,
    number:String,
    year:String,
    coins:{
        type:Number,
        default:0
        
    },
    homeBookings:[{name:String,email:String,phone:{type:String,trim:true},address:String,city:String}],
    officeBookings:[{name:String,email:String,phone:{type:String,trim:true},address:String,city:String}],
    completed:[{date:String,startTime:String,endTime:String,pics:[],name:String,location:String}]

})

const coinsSchema =new mongoose.Schema({
    range:Number,
    price:Number    
})



const secret="Thisisourlittlesecret."
userSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});


const registeredServiceSchema= new mongoose.Schema({
    email: String,
    name:String,
    password: String,
    phone:String,
    pin:String,
    firm:String,
    gst:String,
    address:String,
    number:String,
    city:String,
    state:String,
    proofs:[],
    
})

const ServiceSchema= new mongoose.Schema({
    email: String,
    name:String,
    password: String,
    phone:String,
    pin:String,
    firm:String,
    gst:String,
    address:String,
    number:String,
    city:String,
    state:String,
    proofs:[],
    homeSlots:[{time:[{ type:String, trim: true, default:["No slots available today"] }], date:String}],
    officeSlots:[{time:[{ type:String, trim: true, default:["No slots available today"] }], date:String}],
    homePendings:[{name:String,phone:String,email:String,slot:String,vehicleNo:String,date:String,userQR:String}],
    officePendings:[{name:String,phone:String,email:String,slot:String,vehicleNo:String,date:String,userQR:String}],
    homeEmployees:[{name:String,phone:String,email:String,pin:String,city:String}],
    officeEmployees:[{name:String,phone:String,email:String,pin:String,city:String}],
    completedBookings:[{date:String,startTime:String,endTime:String,vehicleNo:String,customer:String,location:String}],
    homeMulti:Number,homeMaxi:Number,homeAuto:Number,homeSUV:Number,homeHatchback:Number,homeSmall:Number,homeSedan:Number,homeTwoWheeler:Number,homeTempo:Number,homeBus:Number,homeOthers:Number,
    officeMulti:Number,officeMaxi:Number,officeAuto:Number,officeSUV:Number,officeHatchback:Number,officeSmall:Number,officeSedan:Number,officeTwoWheeler:Number,officeTempo:Number,officeBus:Number,officeOthers:Number

})

const registeredEmployeeSchema= new mongoose.Schema({
    email: String,
    name:String,
    password: String,
    phone:String,
    pin:String,
    education:String,
    experience:String,
    city:String,
    number:String,
    resume:[],
    
})

const EmployeeSchema= new mongoose.Schema({
    email: String,
    name:String,
    password: String,
    phone:String,
    pin:String,
    education:String,
    experience:String,
    city:String,
    number:String,
    resume:[],
    company:String,
    pendings:[{name:String,phone:String,email:String,slot:String,vehicleNo:String,date:String}],
    completedWork:[{date:String,startTime:String,endTime:String,phone:String,customer:String}]

})

registeredEmployeeSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});

EmployeeSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});


registeredServiceSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});

ServiceSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});



const regEmployee=new mongoose.model("regEmployee",registeredEmployeeSchema);
const Employee=new mongoose.model("Employee",EmployeeSchema);

const User= new mongoose.model("User",userSchema);
const regService=new mongoose.model("regService",registeredServiceSchema);
const Service=new mongoose.model("Service",ServiceSchema);
const Coin=new mongoose.model("Coin",coinsSchema);

app.get("/",function(req,res){
    res.render("home")
})



app.get("/login",function(req,res){
    res.render("login");
})

app.get("/users",function(req,res){
    User.find({},function(err,users){
        res.render("users",{
            users:users
        })
    })

})

app.get("/qrCode/:userId",function(req,res){
    requestedQR=req.params.userId;
    User.findOne({_id:requestedQR},function(err,user){
        var temp=[{}]
        var name=user.name
        temp.push(name)
        var phone=user.phone
        temp.push(phone)
        var email=user.email
        temp.push(email)
        var vehicleType=user.vehicleType
        temp.push(vehicleType)
        var vehicleCompany=user.vehicleCompany
        temp.push(vehicleCompany)
        var vehicleModel=user.model
        temp.push(vehicleModel)
        var vehicleNo=user.number
        temp.push(vehicleNo)
        var passingYear=user.year
        temp.push(passingYear)
        
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
        var temp=[{ }]
        var name=user.name
        temp.push(name)
        temp.push("_")
        var phone=user.phone
        temp.push(phone)
        var email=user.email
        temp.push(email)
        var vehicleType=user.vehicleType
        temp.push(vehicleType)
        var vehicleCompany=user.vehicleCompany
        temp.push(vehicleCompany)
        var vehicleModel=user.model
        temp.push(vehicleModel)
        var vehicleNo=user.number
        temp.push(vehicleNo)
        var passingYear=user.year
        temp.push(passingYear)

        
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


app.get("/subscription/qrCode/:userId",function(req,res){
    requestedQR=req.params.userId;
    User.findOne({_id:requestedQR},function(err,user){
        var temp=[{}]
        var name=user.name
        temp.push(name)
        var phone=user.phone
        temp.push(phone)
        var email=user.email
        temp.push(email)
        var vehicleType=user.vehicleType
        temp.push(vehicleType)
        var vehicleCompany=user.vehicleCompany
        temp.push(vehicleCompany)
        var vehicleModel=user.model
        temp.push(vehicleModel)
        var vehicleNo=user.number
        temp.push(vehicleNo)
        var passingYear=user.year
        temp.push(passingYear)
        
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
    }

    
    )
})

app.post("/homeAuto",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeAuto:req.body.rate
        }
    })
})
app.post("/homeTwoWheeler",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeTwoWheeler:req.body.rate
        }
    })
})
app.post("/homeSUV",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeSUV:req.body.rate
        }
    })
})
app.post("/homeMaxi",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeMaxi:req.body.rate
        }
    })
})
app.post("/homeTempo",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeTempo:req.body.rate
        }
    })
})
app.post("/homeSmall",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeSmall:req.body.rate
        }
    })
})
app.post("/homeOthers",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeOthers:req.body.rate
        }
    })
})
app.post("/homeBus",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeBus:req.body.rate
        }
    })
})
app.post("/homeHatchback",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeHatchback:req.body.rate
        }
    })
})
app.post("/homeMulti",async (req,res)=>{
    await Service.updateOne({_id:req.body.id},{
        $set:{
            homeMulti:req.body.rate
        }
    })
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
    Service.findOne({name: requestedStationName}, function(err,service){
		res.render("homeSlots", {
		//   image: blog.image,
          slots:service.homeSlots,
          service:service		
        });
	  });
})

app.get("/officeService/:stationName",function(req,res){
    const requestedStationName=req.params.stationName;
    Service.findOne({name: requestedStationName}, function(err,service){
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
            city:employee.city,
            company:req.body.company,
            posting:req.body.posting,
            password:employee.password
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
                    res.redirect("/regEmployees")
                }
            }
            )
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
            city:employee.city,
            company:req.body.company,
            posting:req.body.posting,
            password:employee.password
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
                    res.render("registeredEmployees")
                }
            }
            )
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
                res.redirect("/services")
            }
        })
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

app.post("/charge",function(req,res){
    
    requestedUser=req.body.userEmail
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
            }
            
        }
    
    )

    var token=req.body.stripeToken;
    var chargeAmount=req.body.chargeAmount * 100;
    var charge=stripe.charges.create({
        amount:chargeAmount,
        currency:"inr",
        source:token,

    },
    function(err,charge){
        if(err ==="StripeCardError"){
            console.log("Your card was declined")
        }

    }
    );
    console.log("Your payment was successful")
    res.redirect("/slotBooked")
    


})

app.get("/slotBooked",function(req,res){
    res.render("slotBooked")
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
            User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeTwoWheeler)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           }

           )
       })
   }else if(model=="Sedan"){
        Service.findOne({name:requiredName}, (err,service)=>{
            User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeSedan)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           }
           )
       })

   }else if(model=="Hatchback"){
        Service.findOne({name:requiredName}, (err,service)=>{
            User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeHatchback)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="Auto Rikshaw"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeAuto)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="small"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeSmall)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="SUV"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeSUV)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="Maxi"){
       Service.findOne({name:requiredName},(err,service)=>{
           User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeMaxi)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="Tempo"){
      Service.findOne({name:requiredName}, (err,service)=>{
           User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeTempo)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="Bus"){
       Service.findOne({name:requiredName},  (err,service)=>{
           User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeBus)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="Multi Axel"){
       Service.findOne({name:requiredName}, (err,service)=>{
           User.updateOne({email:userEmail},{
               $inc:{
                   coins:-(service.homeMulti)
               }
           },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
       })

   }else if(model=="others"){
        Service.findOne({name:requiredName}, (err,service)=>{
            User.updateOne({email:userEmail},{
                $inc:{
                    coins:-(service.homeOthers)
                }
            },{
               overwrite:true
           },
           function(err){
               if(err){
                   console.log(err)
               }else{
                   console.log("coin removed")
               }
           })
        })

    }
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
                               phone:detailsPhone
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
            userQR:req.file.key
        });

        const homeSlotIndex = (homeSlots || []).findIndex(homeSlot => homeSlot.date === requiredDate);
        if (homeSlotIndex !== -1) {
            const { time = [] } = homeSlots[homeSlotIndex];
            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
            homeSlots[homeSlotIndex].time = [...updatedTime];
        }

        await Service.updateOne({ name: requiredName }, { $set: { homePendings, homeSlots } });

        console.log("done");
        res.render("bookingDone");
    } catch(err) {
        console.warn("Error in method: ", (err && err.message) || err);
        res.render("bookingFailed");
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
                               phone:detailsPhone
                }
            },
            $inc: {
                coins: -1,
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
            userQR:req.file.filename
        });

        const officeSlotIndex = (officeSlots || []).findIndex(officeSlot => officeSlot.date === requiredDate);
        if (officeSlotIndex !== -1) {
            const { time = [] } = officeSlots[officeSlotIndex];
            const updatedTime = (time || []).filter(timeSlot => timeSlot.trim() !== requiredSlot.trim());
            officeSlots[officeSlotIndex].time = [...updatedTime];
        }

        await Service.updateOne({ name: requiredName }, { $set: { officePendings, officeSlots } });

        console.log("done");
        res.render("bookingDone");
    } catch(err) {
        console.warn("Error in method: ", (err && err.message) || err);
        res.render("bookingFailed");
    }
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

.post(upload.array("files",4),async (req,res)=>{
    
    Employee.findOneAndUpdate({_id:req.body.id},{
       $push:{
           completedWork:{
               customer:req.body.name,
               phone:req.body.phone,
               startTime:req.body.startTime,
               endTime:req.body.endTime,
               date:req.body.date,
               
           }
       } 
    },
    {
        overwrite:false
    },
    function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("work done")
            res.send("Work Completed")
        }
    }
    )
    User.findOneAndUpdate({email:req.body.email},{
        $push:{
            completed:{
                name:req.body.serviceName,
                startTime:req.body.startTime,
                endTime:req.body.endTime,
                date:req.body.date,
                location:req.body.location,
                pics:req.files
            }

        }
        
    },
    {
        overwrite:false
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
                location:req.body.location

            }

        }
    },{
        overwrite:false
    },
    function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("done Work")
        }
    }
    
    )


})



app.get("/servicelogin",function(req,res){
    res.render("serviceLogin")
})

app.route("/upcomingBookings/:serviceId")

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
                vehicleNo:req.body.vehicleNo
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
            res.render("employee alloted")
        }
    }
    )
})







app.get("/upcomingBookings1/:serviceId",function(req,res){
    requestedService=req.params.serviceId
    Service.findOne({_id:requestedService},function(err,service){
        res.render("upcomingBookings1",{
            service:service
        })
    })
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


app.post("/empreg", upload.array("files",10) ,function(req,res){
    const newRegEmployee = new regEmployee({
        email:req.body.username,
        name:req.body.name,
        phone:req.body.phone,
        password:req.body.password,
        pin:req.body.pin,
        education:req.body.education,
        experience:req.body.state,
        city:req.body.city,
        resume:req.files
        

    });
    newRegEmployee.save(function(err){
        if (err) {
            console.log(err)

        }
        else{
            res.render("userLogin")
        }
        
    })
})


app.post("/reg",function(req,res){
    const newRegService = new regService({
        email:req.body.username,
        name:req.body.name,
        phone:req.body.phone,
        password:req.body.password,
        pin:req.body.pin,
        address:req.body.address,
        gst:req.body.gst,
        state:req.body.state,
        city:req.body.city,
        firm:req.body.firm,
        number:req.body.number

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












app.listen(3000,function(){
    console.log("App is running")
})















// app.get("/service/slots/:time",function(req,res){
//     const requestedService=req.params.time;
//     Service.findOne({slots:{$elemMatch:requestedService}},function(err,service){
//         res.render("slot")
//     })
// })