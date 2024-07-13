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


    if(!req.user?._id){
        throw new ApiError(400, "Unauthorized action")
    }
    console.log("aaya")
    const comments = Comment.aggregate(
        [
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
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
            {
                $addFields: {
                    owner: {
                        $arrayElemAt: ["$owner", 0]
                    }
                }
            },

            {
                $project: {
                    content: 1,
                    owner: 1,
                    video: 1,
                    comments: 1
                }
            }
        ]
    )

    const options = {
        page,
        limit
    }

    const results = await Comment.aggregatePaginate(comments, options)

    return res.status(200).json(new ApiResponse(200, results, "Comments retreieved successfully" ))



})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const {content} = req.body;

    if(!req.user){
        throw new ApiError(400, "Please login to comment")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Invalid Comment")
    }

    if(!content){
        throw new ApiError("Empty comment found")
    }

    const commentCreated = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!commentCreated){
        throw new ApiError(500, "Failed to create comment")
    }



    return res.status(200).json(new ApiResponse(200,commentCreated, "Comment Created Successfully!!!"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const {content} = req.body;

    if(!req.user){
        throw new ApiError(400, "Please login to comment")
    }

    if(!content){
        throw new ApiError("Empty comment found")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,{
        content
    })

    if(!comment){
        throw new ApiError(500, "Failed to update comment")
    }

    return res.status(200).json(new ApiResponse(200, "Succesfully updated the comment"))


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if(!req.user){
        throw new ApiError(400, "Please login to comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if(!deletedComment){
        throw new ApiError(500,"Something went wrong while deleting the comment")
    }

    return res.status(200).json(new ApiResponse(200, deletedComment, "Comment Deleted Successfully!!!"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }