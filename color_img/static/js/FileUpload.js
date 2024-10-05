document.addEventListener('DOMContentLoaded', function () {
    const dropzoneFileInput = document.getElementById('dropzone-file');
    const displaySection = document.getElementById('displaySection');
    const colorizeButton = document.getElementById('colorizeButton');
    const initialIcon = document.getElementById('initial-icon');
    const progressBar = document.getElementById('progress-bar');
    const progressInner = document.getElementById('progress-inner');
    const successIcon = document.getElementById('success-icon');
    const uploadText = document.getElementById('upload-text');
    const uploadingText = document.getElementById('uploading-text');
    const browseText = document.getElementById('browse-text');
    const originalImage = document.getElementById('originalImage');
    const colorizedImage = document.getElementById('colorizedImage');

    // Helper function to reset the UI to the initial state
    function resetUI() {
        initialIcon.classList.remove('hidden');
        progressBar.classList.add('hidden');
        progressInner.style.width = '0%';
        successIcon.classList.add('hidden');
        uploadText.textContent = "Drag & Drop your image here";
        uploadingText.classList.add('hidden');
        browseText.classList.remove('hidden');
        colorizeButton.innerHTML = 'Colorize Image';
        colorizeButton.disabled = false;
    }

    // Simulate upload progress with animation
    function simulateUploadProgress() {
        initialIcon.classList.add('hidden');
        progressBar.classList.remove('hidden');
        uploadingText.classList.remove('hidden');
        uploadText.classList.add('hidden');
        browseText.classList.add('hidden');

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            progressInner.style.width = `${progress}%`;

            if (progress >= 100) {
                clearInterval(progressInterval);
                progressBar.classList.add('hidden');
                successIcon.classList.remove('hidden');
                uploadingText.classList.add('hidden');
                uploadText.classList.remove('hidden');
                uploadText.innerHTML = `
                    <span class="text-3xl font-extrabold text-green-600">Upload Successful!</span><br>
                    <span class="text-lg font-medium text-gray-700">Click "Colorize Image" to continue.</span>`;
                browseText.classList.remove('hidden');
            }
        }, 200);
    }

    // Event listener for file selection
    dropzoneFileInput.addEventListener('change', () => {
        if (dropzoneFileInput.files.length > 0) {
            resetUI();
            simulateUploadProgress();
        }
    });

    // Submit event for "Colorize Image" button
    colorizeButton.addEventListener('click', async (e) => {
        e.preventDefault();
        colorizeButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg> Processing...`;
        colorizeButton.disabled = true;

        const csrfToken = getCSRFToken();
        const formData = new FormData();
        formData.append('image', dropzoneFileInput.files[0]);

        try {
            const response = await fetch(colorizeButton.form.action, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                body: formData,
            });

            if (response.ok) {
                const html = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                originalImage.src = tempDiv.querySelector('#originalImage').getAttribute('src');
                colorizedImage.src = tempDiv.querySelector('#colorizedImage').getAttribute('src');
                displaySection.classList.remove('hidden');
            } else {
                uploadText.innerHTML = `<span class="text-3xl font-extrabold text-red-600">Upload Failed!</span>`;
            }
        } catch (error) {
            console.error('Error:', error);
            uploadText.innerHTML = `<span class="text-3xl font-extrabold text-red-600">Upload Failed!</span>`;
        } finally {
            resetUI();
        }
    });

    // CSRF Token retrieval function
    function getCSRFToken() {
        let csrfToken = null;
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                csrfToken = decodeURIComponent(value);
            }
        });
        return csrfToken;
    }
});
