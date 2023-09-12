const path = require('path');
const os = require('os');
const fs = require('fs');
const ResizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { config } = require('./common/config');
const resizeImg = require('resize-img');

let mainWindow;

const menuTemplate = [
  ...(config.isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!config.isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
            },
          ],
        },
      ]
    : []),
];

// Listen for image:resize
ipcMain.on('image:resize', (e, options) => {
	options.dest = path.join(os.homedir(), 'ImageResizer');
	resizeImage(options);
});

// Resize image
async function resizeImage({ imgPath, width, height, dest }) {
	try {
		const newPath = await resizeImg(fs.readFileSync(imgPath), {
			width: +width,
			height: +height,
		});

		// Create filename
		const outputFilename = path.basename(imgPath);

		// Create dest folder if it doesn't exist
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}

		// Write new image to dest
		fs.writeFileSync(path.join(dest, outputFilename), newPath);
		
		// Send success message to renderer
		mainWindow.webContents.send('image:done');

		// Open dest folder
		shell.openPath(dest);
	} catch (error) {
		console.log(error);	
	}
}

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: 800,
    height: 600,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: true,
			preload: path.join(__dirname, 'preload.js'),
		},
  });

	// Open devtools if in dev environment
	if (config.isDev) {
		mainWindow.webContents.openDevTools();
	}

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create about window
function createAboutWindow() {
	const aboutWindow = new BrowserWindow({
		title: 'About Image Resizer',
		width: 300,
		height: 300,
		webPreferences: { nodeIntegration: true },
	});

	aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// App is ready
app.whenReady().then(() => {
	createMainWindow();

	// Build menu from template
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	
	// Remove mainWindow from memory when closed
	mainWindow.on('closed', () => (mainWindow = null));

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (!config.isMac) {
    app.quit();
  }
});