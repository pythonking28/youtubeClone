import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwt from 'jsonwebtoken'
import { uploadOnCloudinary } from "../utils/fileUpload.js";

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
    
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }
  
  if (!email.includes("@")) {
    throw new ApiError(400, "Enter a valid email address");
  }
  

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  

  if(existedUser){
    console.log("doosra email de bhai")
    throw new ApiError(409, "User with email or username already exists")
  }
  
  
  const avatarLocalPath = req.files?.avatar ? req.files?.avatar[0]?.path :( new ApiError(400,"Avatar file requried"));
  const coverImageLocalPath = req.files?.coverImage ? req.files?.coverImage[0]?.path : "";

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!avatar){
    throw new ApiError(400, "Avatar file is required")
  }

  // Entry to database
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url ? coverImage.url : "",
    email,
    password 

  })
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User Registered Successfully" )
  )
});

const loginUser = asyncHandler(async (req, res)=>{
  const {email, username, password} = req.body;
  if(!(username || email)){
    throw new ApiError(400,"Username or Email is required");
  }
  
  const user = await User.findOne({
    $or:[{email},{username}]
  })
  
  if(!user){
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid= await user.isPasswordCorrect(password);
  console.log(isPasswordValid)
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
  }
  
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200).cookie("accessToken",accessToken, options).cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "user logged in successfully"
    )
  )
})

const logOutUser = asyncHandler(async(req,res)=>{
  const user = req.user;
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {refreshToken: undefined}
    },{
      new: true
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200, "User Logged Out Successfully"))
})

const refreshAccessToken = asyncHandler(async(req, res) =>{
 try {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
   if(!incomingRefreshToken){
     throw new ApiError(401, "unauthorized request")
   }
   const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   const user = await User.findById(decodedToken?._id)
   if(!user){
     throw new ApiError(401, "Invlid Refresh Token")
    }
 
   if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401, "Refresh Token is expired")
   }
   const options = {
     httpOnly: true,
     secure: true
   }
   const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
   return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(200,{
     accessToken, newRefreshToken
   },"Access Token refreshed Succesfully"))
 } catch (error) {
  throw new ApiError(401,error?.message || "Invali refresh token")
 }

})



export {registerUser,loginUser, logOutUser, refreshAccessToken};
