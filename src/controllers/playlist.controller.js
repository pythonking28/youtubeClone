import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!req.user?._id){
        throw new ApiError(400,"Unauthorized Request")
    }

    if(!name || !description){
        throw new ApiError(400,"Please provide both name and description")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(500, "Failed to create the playlist")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully!!!"))


    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"Provide the userId")
    }
    if(!req.user?._id){

        throw new ApiError(400,"Unauthorized request")
    }
    const playlists = await Playlist.find(
        {
            owner: userId
        }
    )

    if(!playlists){
        throw new ApiError(500, "Failed to retrieve playlist collection")
    }

    res.status(200).json( new ApiResponse(200, playlists, "Playlists retreived successfully!!!"))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400,"Provide the playlist id")
    }
    if(!req.user?._id){

        throw new ApiError(400,"Unauthorized request")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(500, "Failed to get the requested playlist")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist successfully found"))
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //TODO: add video to playlist
    if(!playlistId || !videoId){
        throw new ApiError(400,"Provide the playlist id")
    }
    if(!req.user?._id){

        throw new ApiError(400,"Unauthorized request")
    }
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(500, "Failed to get the playlist")
    }
    const videoMatched = playlist.videos.some(video=> video.toString() === videoId)
    if(videoMatched){
        return res.status(400).json(new ApiResponse(400, "Video Already in playlist"))
    }

    playlist.videos.push(videoId);

    const playlistUpdated = await playlist.save();

    if(!playlistUpdated){
        throw new ApiError(500, "Failed to update the playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlistUpdated,"Video Added to playlist successfully!!!"))


    

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId){
        throw new ApiError(400,"Provide the playlist id")
    }
    if(!req.user?._id){

        throw new ApiError(400,"Unauthorized request")
    }
    let playlist = await Playlist.findById(playlistId);

    const videoMatched = playlist.videos.some(video=> video.toString() === videoId)
    if(!videoMatched){
        return res.status(400).json(new ApiResponse(400, "Video Not in the playlist"))
    }

    playlist.videos = playlist.videos.filter(video => video.toString() !== videoId)

    const playlistUpdated = await playlist.save()

    if(!playlistUpdated){
        throw new ApiError(500, "Failed to update the playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlistUpdated,"Video Removed from playlist successfully!!!"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Provide the playlist id")
    }
    
    if(!req.user?._id){

        throw new ApiError(400,"Unauthorized request")
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if(!playlist){
        throw new ApiError(500, "Failed to delete the playlist")
    }
    return res.status(200).json(new ApiResponse(200, "Playlist removed successfully!!!"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(400,"Provide the playlist id")
    }
    if(!name || !description){
        throw new ApiError(400,"Please provide both name and description")
    }
    if(!req.user?._id){

        throw new ApiError(400,"Unauthorized request")
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            name,
            description
        }
    );

    if(!playlist){
        throw new ApiError(500, "Failed to update the playlist")
    }
    return res.status(200).json(new ApiResponse(200, "Playlist updated successfully!!!"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}