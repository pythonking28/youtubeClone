import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"Something went wrong while applying like to the video")
    }
    if(!req.user?._id){
        throw new ApiError(400,"Unauthorized Request")
    }
    const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })
    if(!like){
        throw new ApiError(500, "Something went wrong while liking the video")
    }
    return res.status(200).json(new ApiResponse(200, like, "Successfully Liked the video"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400,"Something went wrong while applying like to the comment")
    }
    if(!req.user?._id){
        throw new ApiError(400,"Unauthorized Request")
    }
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })
    if(!like){
        throw new ApiError(500, "Something went wrong while liking the comment")
    }
    return res.status(200).json(new ApiResponse(200, like, "Successfully Liked the comment"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(400,"Something went wrong while applying like to the tweet")
    }
    if(!req.user?._id){
        throw new ApiError(400,"Unauthorized Request")
    }
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if(!like){
        throw new ApiError(500, "Something went wrong while liking the tweet")
    }
    return res.status(200).json(new ApiResponse(200, like, "Successfully Liked the video"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if(!req.user._id){
        throw new ApiError(400, "Unauthorized Request")
    }
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $match: {
                video: {
                    $exists: true
                }
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(500, "Failed to retreie the liked videos")
    }

    return res.status(200).json(new ApiResponse(200,likedVideos,'Successfully reterived liked videos' ))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}