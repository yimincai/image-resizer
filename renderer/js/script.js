const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
	const file = e.target.files[0];
	if (!isFileImage(file)) {
		alertError('Please select an image file');
		return;
	}

	// Get original image dimensions
	const img = new Image();
	img.src = URL.createObjectURL(file);
	img.onload = function () {
		widthInput.value = this.width;
		heightInput.value = this.height;
	};

	form.style.display = 'block';
	filename.innerText = file.name;
	outputPath.innerText = path.join(os.homedir(), 'ImageResizer');
}

// Send image to main process
function sendImage(e) {
	e.preventDefault();

	const width = widthInput.value;
	const height = heightInput.value;
	const imgPath = img.files[0].path;

	if (!img.files[0]) {
		alertError('Please select an image');
		return;
	}

	if (width === '' || height === '') {
		alertError('Please enter a width and height');
		return;
	}

	// Send image to main using ipcRenderer
	ipcRenderer.send('image:resize', {
		imgPath,
		width,
		height,
	});
}

// Listen for image:done
ipcRenderer.on('image:done', () => {
	alertSuccess('Image resized successfully');
});

// Check if file is an image
function isFileImage(file) {
	const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
	return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message) {
	Toastify.toast({
		text: message,
		duration: 3000,
		close: false,
		style: {
			backgroundColor: 'red',
			color: 'white',
			textAlign: 'center'
		}
	})
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    style: {
      backgroundColor: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage );