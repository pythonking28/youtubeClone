import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId){
        throw new ApiError(400, "Channel Not provided")
    }
    if(!req.user?._id){
        throw new ApiError(400, "Unauthorized request")
    }


    const channel = await Subscription.find({
        channel: channelId
    })
    if(channel.length === 0){
        const channelCreated = await Subscription.create({
            channel: channelId,
            subscriber: req.user?._id
        })
        if(!channelCreated){
            throw new ApiError(500,"Failed to create the channel")
        }
        return res.status(200).json(new ApiResponse(200, channelCreated, "Channel Created and subscriber added successfully"))
    }
    console.log(channel)
    if(!subscriber){
        throw new ApiError(500, "Failed to subscribe the channel")
    }

    return res.status(200).json(new ApiResponse(200, subscriber ))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log(channelId)
    if(!channelId){
        return res.status(400).json(new ApiResponse(400,"Please provide channgel Id"))
    }
    if(!req.user?._id){
        return res.status(400).json(new ApiResponse(400, "Please login first"))
    }

    const subscribers = await Subscription.find(
        {
            channel: channelId
        }
    )
    return res.status(200).json(new ApiResponse(200,subscribers,"Subscribers Retreived"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    // console.log(subscriberId)
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}