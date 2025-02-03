const express = require("express");
const router=express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const Razorpay = require("razorpay");



//Index Route
router.get("/",  wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}
));
  //New Route
  router.get("/new",isLoggedIn,(req, res) => {
    res.render("listings/new.ejs");
  }
  ); 
  
  //Show Route
  router.get("/:id",  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",
      populate:{path:"author"},}).populate("owner");
     if(!listing){
      req.flash("error","listing you requested does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);
  //buy route
  router.get("/:id/buy",  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","listing you requested does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/buy.ejs", { listing });
  }));
   
  //pay route
  const razorpay = new Razorpay({
    key_id: "YOUR_RAZORPAY_KEY",
    key_secret: "YOUR_RAZORPAY_SECRET"
  });
  
  router.get("/:id/buy/pay", async (req, res) => {
    const order = await razorpay.orders.create({
        amount: amount * 100, // Convert to paisa
        currency: "INR",
        receipt: "order_rcptid_11"
    });
    res.render("listings/pay.ejs", { listing });
    });
    
  //Create Route
  router.post("/",isLoggedIn,wrapAsync( async (req, res, next) => {
    const { error } = listingSchema.validate(req.body); // Validate request body
    if (error) {
      throw new ExpressError(400, error.details.map((el) => el.message).join(", "));
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  }));
  
  //Edit Route
  router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","listing you requested does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }));
  
  //Update Route
  router.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(async (req, res) => {
    if(!req.body.listing){
      throw new ExpressError(400,"send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","listing updated!");
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
  router.delete("/:id",isLoggedIn,isOwner,  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","listing deleted!");
    res.redirect("/listings");
  }));
   
  module.exports=router;