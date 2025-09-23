import { promises as fsPromises } from "fs";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: "dt2lhechn",
    api_key: "242838256114175",
    api_secret: "I6W-rU3gSh4rOAy62ApP1Z4sW3g",
});



export const uploadToCloudinary = async (localpath) => {
  try {
    if (!localpath) return null;

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto", // Automatically detect file type
      transformation: [
        { quality: "auto", fetch_format: "auto" }, // Optimize quality and format
      ],
    });

    // Async file deletion after upload
    await fsPromises.unlink(localpath);

    return response;
  } catch (error) {
    console.error("Error encountered during Cloudinary upload:", error.message);

    // Async file deletion in case of error as well
    await fsPromises.unlink(localpath);

    return { message: "Fail" };
  }
};


export const deleteFromCloudinary = async (public_id) => {
    try {
        if (!public_id) return null;

        const response = await cloudinary.uploader.destroy(public_id, {
            resource_type: "image",
        });

        return response;
    } catch (error) {
        console.log("Cloudinary delete error: ", error.message);
        return { message: "Delete Failed" };
    }
};

