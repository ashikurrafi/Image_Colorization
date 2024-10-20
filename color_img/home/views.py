from django.http import HttpResponse
from django.shortcuts import render
import os
import cv2
import numpy as np
from skimage.color import rgb2lab, lab2rgb
from keras.models import model_from_json
from django.core.files.storage import FileSystemStorage
from django.conf import settings

BASE_DIR = settings.BASE_DIR
MEDIA_ROOT = settings.MEDIA_ROOT


def index(request):
    return HttpResponse("Hello world!")


def load_model(model_json_path, model_weights_path):
    # Load the JSON model configuration
    with open(model_json_path, "r") as json_file:
        loaded_model_json = json_file.read()

    # Create model from JSON
    loaded_model = model_from_json(loaded_model_json)

    # Load weights into new model
    loaded_model.load_weights(model_weights_path)

    return loaded_model


def colorize_image(image_path, image_name):
    try:
        # Define paths to model JSON and weights
        model_json_path = os.path.join(BASE_DIR, "home", "dl_models", "model.json")
        model_weights_path = os.path.join(BASE_DIR, "home", "dl_models", "model.h5")

        # Load the pre-trained model
        loaded_model = load_model(model_json_path, model_weights_path)
        loaded_model.summary()

        # Load the image
        img = cv2.imread(image_path)

        # Check if image is read correctly
        if img is None:
            print(f"Couldn't read image {image_path}. Exiting.")
            return

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img, (256, 256))

        # Preprocess the image for colorization
        colorize_input = np.array(img_resized, dtype=float)
        colorize_input = rgb2lab(1.0 / 255 * colorize_input)[:, :, 0]
        colorize_input = colorize_input.reshape(
            1, colorize_input.shape[0], colorize_input.shape[1], 1
        )

        # Predict colorization
        output = loaded_model.predict(colorize_input)
        output *= 128

        # Combine grayscale image and predicted ab values
        cur = np.zeros((256, 256, 3))
        cur[:, :, 0] = colorize_input[0][:, :, 0]
        cur[:, :, 1:] = output[0]
        colorized_image = lab2rgb(cur)

        # Convert the colorized image to the appropriate data type for saving
        colorized_image_uint8 = (colorized_image * 255).astype(np.uint8)

        # Save the colorized image
        colorized_image_path = os.path.join(
            MEDIA_ROOT, "colorized", f"colorized_{image_name}"
        )
        cv2.imwrite(
            colorized_image_path, cv2.cvtColor(colorized_image_uint8, cv2.COLOR_RGB2BGR)
        )
        print(f"Colorized image saved at: {colorized_image_path}")

    except Exception as e:
        print(f"Error processing image: {e}")

def resize_image(image_path, size=(256, 256)):
    # Open the image using OpenCV
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Invalid image file.")

    # Resize the image to the desired size
    resized_img = cv2.resize(img, size)

    # Save the resized image back to the file system
    cv2.imwrite(image_path, resized_img)


def upload_image(request):
    if request.method == "POST" and request.FILES.get("image"):
        try:
            image_file = request.FILES["image"]
            fs = FileSystemStorage(location=os.path.join(MEDIA_ROOT, "originals"))
            # Save the uploaded image to /media/originals temporarily
            filename = fs.get_available_name(os.path.basename(image_file.name))
            uploaded_image_path = fs.save(filename, image_file)
            uploaded_image_full_path = fs.path(uploaded_image_path)

            # Resize the image to 256x256 before proceeding
            resize_image(uploaded_image_full_path, size=(256, 256))

            # Get the image name for future reference
            image_name = os.path.basename(uploaded_image_full_path)

            # Call the colorize_image function with the resized image
            colorize_image(uploaded_image_full_path, image_name)

            # Provide the colorized image URL to the template for rendering
            colorized_image_url = os.path.join(
                settings.MEDIA_URL, "colorized", f"colorized_{image_name}"
            )
            # Get the URL of the original image
            original_image_url = os.path.join(settings.MEDIA_URL, "originals", filename)

            # Define the download filename
            download_filename = f"colorized_{image_name}"

            return render(
                request,
                "main.html",
                {
                    "original_image_url": original_image_url,
                    "colorized_image_url": colorized_image_url,
                    "download_filename": download_filename,
                },
            )
        except KeyError:
            print("No image file selected.")
            return render(
                request,
                "test_template/upload_form.html",
                {"error_message": "No image file selected."},
            )
        except Exception as e:
            print(f"Error uploading image: {e}")
            return render(
                request,
                "test_template/error.html",
                {"message": f"Error uploading image: {e}"},
            )
    else:
        return render(request, "main.html")
