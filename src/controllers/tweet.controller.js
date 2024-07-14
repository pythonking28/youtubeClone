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

    if(!req.user?._id){
        throw new ApiError(400, "Unauthorized Request")
    }

    const tweetData = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
    if(!tweetData){
        throw new ApiErro(400, "Failed to the the tweets")
    }


    return res.status(200).json(new ApiResponse(200, tweetData, "Tweets retreived Successfully" ))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const {content} = req.body
    if(!tweetId){
        throw new ApiError(400, "Tweet Id is required")
    }
    if(!content){
        throw new ApiError(400, "No tweet was received")
    }
    if(!req.user?._id){
        throw new ApiError(400, "Unauthorized Request")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content
        }

    )

    if(!updatedTweet){
        throw new ApiError(500, "Failed to update the tweet")
    }
    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet Updated Successfully!!!"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400, "Tweet Id is required")
    }
    if(!req.user?._id){
        throw new ApiError(400, "Unauthorized Request")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if(!deletedTweet){
        throw new ApiError(400, "Failed to delete the tweet")
    }
    return res.status(200).json(new ApiResponse(200, deletedTweet,"Tweet Deleted Successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}