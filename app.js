const express = require("express");
const app = express();
exports.app = app;
const mongoose=require("mongoose");
const Listing = require("./models/listing");
 const mongo_url="mongodb://127.0.0.1:27017/airbnb";
const methodoveride = require("method-override");
const ejsmate = require("ejs-mate");
const expresserror = require("./util/expresserror");
const asyncwrap = require("./util/asyncwrap");
const review = require("./models/review.js");
const {listingSchema ,reviewschema} = require("./schema.js");



main().then(()=>{
  console.log("connected to db");
}).catch((err)=>{
 console.log(err);
})
async function main(){
    await mongoose.connect(mongo_url);
};
const path = require("path");
const listing = require("./models/listing");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

// to get information from the url or user request we have write this line
app.use(express.urlencoded({extended: true}));
app.use(methodoveride("_method"));
app.engine('ejs', ejsmate);
//this is used to for static files
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.send("HI iam root");
});
// middle wares use
const middlewareserror = require("./middlewares.js");
app.use("/api",(req,res,next)=>{
      let {token}=req.query;
      if(token==="abcf"){
        next();
      }
      throw new middlewareserror(403,"acces denied");
});

app.get("/api",(req,res,next)=>{
    res.send("data");
});
// error handlers(middlewares)
app.get("/err",(req,res,next)=>{
    abcd=abcd;
})

app.use((err,req,res,next)=>{
   let {status=500,message="something went wrong"}=err;
     res.status(401).send(message);
});

const validateListing =(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new expresserror(404,errMsg)  ;
    }else{
        next();
    };
};

const validatereview =(req,res,next)=>{
    let {error}=reviewschema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new expresserror(404,errMsg)  ;
    }else{
        next();
    };
};











//index route
app.get("/listing",asyncwrap(async(req,res)=>{
    const alllisting =  await Listing.find({});
    res.render("listing/index.ejs",{alllisting});
   }));


//new route
app.get("/listing/new",(req,res)=>{
    res.render("listing/new.ejs");
});



//show route
app.get("/listing/:id",asyncwrap(async(req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id).populate("reviews");
    res.render("listing/show.ejs",{listing});

}));
//create  
app.post("/listing",validateListing,asyncwrap(async(req,res)=>{
    const newlisting= new Listing(req.body.listing);
    if(!req.body.listing){
        throw new expresserror(500,"enter the valid vales of the list");
    };
    await newlisting.save();
    res.redirect("/listing");

}));
//edit 
app.get("/listing/:id/edit",asyncwrap(async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listing/edit.ejs",{listing});
}));
//Update Route
app.put("/listing/:id",asyncwrap( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listing/${id}`);
  }));

//delete listing
app.delete("/listing/:id",asyncwrap(async(req,res)=>{
    let {id}= req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    res.redirect("/listing");
}));

//reviews
//post route
app.post("/listing/:id/reviews",validatereview,asyncwrap(async(req,res)=>{
 let listing = await Listing.findById(req.params.id);
 let newreview = new review(req.body.review);

 listing.reviews.push(newreview);

 await newreview.save();
 await listing.save();

 console.log("new review is submiiteed");
 res.redirect("/listing");
}));

// review delte route
app.delete("/listing/:id/reviews/:reviewId",asyncwrap(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/listing/${id}`);
}))


app.listen(8080,()=>{
    console.log("server is listening");
});

app.all("*",(req,res,next)=>{
    next(new expresserror(404,"page is not found"));
})
app.use((err,req,res,next)=>{
    let {statuscode=500,message="something went wrong"}=err;
    res.status(statuscode).render('listing/err.ejs',{message});
});
