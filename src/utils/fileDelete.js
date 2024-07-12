import {v2 as cloudinary} from 'cloudinary'
import { ApiError } from './ApiError.js'

const deleteFromCloudinary = async(fileUrl, resourceType="image") => {
    try {
        if(!fileUrl) return null

        const fileName = fileUrl.split('/').pop().split('.')[0];


        const deletedConfirmation = await cloudinary.uploader.destroy([fileName],{
            resource_type: resourceType,
            type: "upload"
        })


        
        return deletedConfirmation

    } catch (error) {
        throw new ApiError(500, "Failed to delete the file. Try sometime later")
    }
}

export {deleteFromCloudinary}