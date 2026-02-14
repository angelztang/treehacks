import requests
import base64
from PIL import Image
import io
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_image_upload():
    try:
        # Read the image file
        with open('test_tshirt.jpg', 'rb') as image_file:
            # Convert to base64
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Get backend URL from environment variable
            backend_url = os.getenv('SERVICE_URL', 'https://tigerpop-marketplace-backend-76fa6fb8c8a2.herokuapp.com')
            url = f'{backend_url}/api/listing/test-upload'
            
            print(f'Testing upload to: {url}')
            
            # Send to our test endpoint
            response = requests.post(url, json={'image': base64_image})
            
            print('Response status:', response.status_code)
            if response.status_code == 200:
                print('Response body:', response.json())
            else:
                print('Error response:', response.text)
    except FileNotFoundError:
        print("Error: test_tshirt.jpg not found in current directory")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    test_image_upload() 