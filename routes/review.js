const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync =require("../utils/wrapAsync.js");
const ExpressError =require("../utils/ExpressError.js");

const review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");



//reviews post route
router.post("/",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
 
  const listing = await Listing.findById(req.params.id);
  let newReview=new review(req.body.review);
newReview.author=req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success","new review created!");
  res.redirect(`/listings/${listing.id}`);
  console.log(listing.reviews);

}));
  //delete reveiw route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,
    wrapAsync(async(req,res)=>{
      let {id,reviewId}=req.params;
      await  Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
      await review.findByIdAndDelete(reviewId);
      req.flash("success","review deleted!");
      res.redirect(`/listings/${id}`);
    }));
    
  module.exports=router;