import mongoose, { mongo } from "mongoose"
import {Comment} from "../models/comment.models.js"
import { User } from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const {comment} = req.body;

    if(!req.user){
        throw new ApiError(400, "Please login to comment")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Invalid Comment")
    }

    if(!comment){
        throw new ApiError("Empty comment found")
    }

    const commentCreated = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user?._id
    })

    if(!commentCreated){
        throw new ApiError(500, "Failed to create comment")
    }



    return res.status(200).json(new ApiResponse(200, "Comment Created Successfully!!!"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }