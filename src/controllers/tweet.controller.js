import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if(!req.user?._id){
        throw new ApiError(400, "Unauthorized Request")
    }
    if(!content){
        throw new ApiError(400, "Empty tweet detected");
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet){
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet Created Successfully!!!"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if(!userId){
        throw new ApiError(400, "No user Id detected");
    }

    console.log("AAya 1")
    if(!req.user?._id){
        throw new ApiError(400, "Unauthorized Request")
    }
    console.log("AAya 2")

    const tweetData = await Tweet.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

    ])
    console.log("AAya 3")

    return res.status(200).json(new ApiResponse(200, tweetData, "Tweets retreived Successfully" ))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}