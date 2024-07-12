import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { deleteFromCloudinary } from "../utils/fileDelete.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "video",
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination
  
  const options = {
    page: page,
    limit: limit
};
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!req.user) {
    throw new ApiError(400, "Please Login");
  }

  if (!title || !description) {
    throw new ApiError(400, "Both fields are required!!!");
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Please Provide both video and thumbnail");
  }

  const videoFileData = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnailFileData = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFileData || !thumbnailFileData) {
    throw new ApiError(
      500,
      "Something went wrong while uploading the video and thumbnail"
    );
  }

  const publishedVideo = await Video.create({
    videoFile: videoFileData.url,
    thumbnail: thumbnailFileData.url,
    title: title,
    description: description,
    duration: videoFileData.duration,
    owner: req.user?._id,
  });

  if (!publishedVideo) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, publishedVideo, "Video Published Sucessfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Please provide the video id");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, "Something went wrong while loading the video");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video Retrevied Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail

  if (!videoId) {
    throw new ApiError(400, "Please provide the video id");
  }
  if (!title || !description) {
    throw new ApiError(400, "Please provide both title and description");
  }

  const thumbnailLocalPath = req.file?.path;
  const video = await Video.findById(videoId);

  const oldVideoThumbnailPath = video.thumbnail;
  const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath);
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnailUploaded.url,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong while updating thumbnail");
  }

  await deleteFromCloudinary(oldVideoThumbnailPath);

  return res
    .status(201)
    .json(new ApiResponse(201, updatedVideo, "Video Updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Please provide the video id");
  }
  const video = await Video.findById(videoId);

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(500, "Failed to delete the video");
  }
  await deleteFromCloudinary(video.thumbnail);
  await deleteFromCloudinary(video.videoFile, "video");

  return res.status(200).json(new ApiResponse(200, "Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Please provide the video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(
      500,
      "No such id exists"
    );
  }
  video.isPublished = !video.isPublished;
  const updatedVideo = await video.save();
  console.log(updatedVideo);
  if (!updatedVideo) {
    throw new ApiError(
      500,
      "Something went wrong while updating publish status of video"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Successfuly changed publish status"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
