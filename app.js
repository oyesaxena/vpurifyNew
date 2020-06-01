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


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect('mongodb://localhost:27017/vpurifyDB',{useNewUrlParser:true, useUnifiedTopology:true });

var Storage = multer.diskStorage({
	destination: "public/uploads/",
	filename: (req,file,cb)=>{
	  cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  
	}
  })
  var upload = multer({
	storage:Storage
  })

const userSchema=new mongoose.Schema({
    email: String,
    name:String,
    password:String ,
    phone:String,
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
    bookings:[]
    
})

const coinsSchema =new mongoose.Schema({
    coins:[{range:String,
            price:String        }]    
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
    homeSlots:[{time:String, date:String}],
    officeSlots:[{time:String,date:String}],
    pendings:[{name:String,phone:String,email:String,slot:String}]
})



registeredServiceSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});

ServiceSchema.plugin(encrypt, { secret: secret , encryptedFields:['password']});




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
        temp.push(name)
        var phone=user.phone
        temp.push(phone)
        
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
                    officeSlots:{time:req.body.newTime,
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
    var chargeAmount=req.body.chargeAmount;
    var charge=stripe.charges.create({
        amount:chargeAmount,
        currency:"inr",
        source:token,

    },
    function(err,charge){
        if(err & err.type==="StripeCardError"){
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

app.route("/homeBooking/:stationName/:timeSlot")

.get(function(req,res){
    var userEmail=req.body.yourEmail;
    var requiredName=req.params.stationName;
    var requiredSlot=req.params.timeSlot;
    Service.findOne({name:requiredName},function(err,service){
        res.render("homeBooking",{
            service:service.name,
            slot:requiredSlot
        })
    })

    
})

.post(function(req,res){
    var userEmail=req.body.yourEmail
    var requiredName=req.params.stationName
    var requiredSlot=req.params.timeSlot;
    User.updateOne({email:userEmail},{
        $push:{
            bookings:req.body.details
        },
        $inc:{
            coins:-2
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
            console.log("successful")
            res.render("bookingDone")
        }
    }
    )
    Service.updateOne({name:requiredName},{
        $push:{
            pendings:{
                name:req.body.userName,
                email:req.body.yourEmail,
                phone:req.body.phone,
                slot:requiredSlot
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
        }
    }
    )



})

app.get("/userDashboard/:userId",function(req,res){
    requestedUser=req.params.userId
    User.findOne({_id:requestedUser},function(err,user){
        res.render("userDashboard",{
            bookings:user.bookings
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
app.get("/servicelogin",function(req,res){
    res.render("serviceLogin")
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
                        user:foundService

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
        coins:{
            range:req.body.range,
            price:req.body.price

        }
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


app.post("/register",function(req,res){
    const newUser = new User({
        email:req.body.username,
        name:req.body.name,
        phone:req.body.phone,
        password:req.body.password,
        vehicleType:req.body.vehicleType,
        vehicleCompany:req.body.company,
        model:req.body.model,
        number:req.body.vehicleNo,
        year:req.body.passingYear
    });
    newUser.save(function(err){
        if (err) {
            console.log(err)

        }
        else{
            res.redirect("/login")
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
            res.render("proof")
        }
    })
})







app.route("/proof/:serviceId")

.get(function(req,res){
    requestedProof=req.params.serviceId
    regService.findOne({_id:requestedProof},function(err){
        if(!err){
            res.render("proof")
        }
        else{
            console.log(err)
        }
        
    })
    
})

.post( upload.array("files",60),function(req,res,next){
    requestedProof=req.params.serviceId
    regService.updateOne({_id:requestedProof},{
        $push:{
            proofs:req.files
        },
    },
    {
        overwrite:true
    },
    function(err){
        if(!err){
            res.render("proof")
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