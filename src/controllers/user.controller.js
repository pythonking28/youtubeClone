import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

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

export default registerUser;
