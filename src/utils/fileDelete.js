import {v2 as cloudinary} from 'cloudinary'
import { ApiError } from './ApiError.js'
import { ApiResponse } from './ApiResponse.js'

const deleteFromCloudinary = async(fileUrl) => {
    try {
        if(!fileUrl) return null

        await cloudinary.uploader.destroy(fileUrl,{
            resource_type: "auto"
        })

        
        return res.status(204).json(new ApiResponse(204, "Succesfuly deleted from cloudinary"))

    } catch (error) {
        throw new ApiError(500, "Failed to delete the file. Try sometime later")
    }
}

export {deleteFromCloudinary}