import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  if (!req.user?._id) {
    throw new ApiError(400, "Unauthorized request");
  }
  //Subscriber count
  const channelList = await Subscription.find({
    channel: req.user?._id,
  });
  if (channelList.length === 0) {
    return res.status(400).json(new ApiResponse(400, "No channel exists"));
  }
  const subscribers = channelList.reduce((acc, channel) => acc + 1, 0);

  //total videos

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        likes: 1
      },
    },
  ]);

  const totalViews = videos.reduce((acc, channel) => acc += channel.views, 0);

  const totalVideos = videos.reduce((acc, channel) => acc += 1, 0);

  const totalLikes = videos.reduce((acc, channel) => acc += channel.likes, 0);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {totalVideos, subscribers, totalViews, totalLikes},
        "The channel stats retreived successfully!!!"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  if (!req.user?._id) {
    throw new ApiError(400, "Unauthorized request");
  }
  //Subscriber count
  const channelList = await Subscription.find({
    channel: req.user?._id,
  });
  if (channelList.length === 0) {
    return res.status(400).json(new ApiResponse(400, "No channel exists"));
  }

  const videos = await Video.find(
    {
        owner: req.user?._id
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        "The channel stats retreived successfully!!!"
      )
    );
});

export { getChannelStats, getChannelVideos };
