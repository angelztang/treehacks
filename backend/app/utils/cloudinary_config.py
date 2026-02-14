import os
import cloudinary
import cloudinary.uploader

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def upload_image(image_file):
    """
    Upload an image to Cloudinary and return the result
    """
    try:
        # Upload the image
        result = cloudinary.uploader.upload(image_file)
        # Return the full result object
        return result
    except Exception as e:
        print(f"Error uploading image to Cloudinary: {str(e)}")
        raise e  # Re-raise the exception to handle it in the route 