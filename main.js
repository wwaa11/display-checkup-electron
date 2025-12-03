require("dotenv").config();

const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

function readStationFromConfig() {
	try {
		// Primary: Electron userData path
		const userDataFile = path.join(app.getPath("userData"), "station.txt");
		if (fs.existsSync(userDataFile)) {
			return fs.readFileSync(userDataFile, "utf8").trim();
		}

		// Fallback: installer-persisted path under AppData\Display Checkup
		const appDataFile = path.join(
			app.getPath("appData"),
			"Display Checkup",
			"station.txt"
		);
		if (fs.existsSync(appDataFile)) {
			return fs.readFileSync(appDataFile, "utf8").trim();
		}
	} catch (_) {}
	return null;
}

function getStationArg() {
	try {
		// get form command line argument
		const arg = (process.argv || []).find((a) => a.startsWith("--s="));
		if (arg) return arg.split("=")[1];
		// get from environment variable
		if (process.env.STATION) return process.env.STATION;
		// get from config file
		const fromFile = readStationFromConfig();
		if (fromFile) return fromFile;
	} catch (_) {}

	return "default";
}

function createWindow() {
	const station = getStationArg();
	const win = new BrowserWindow({
		width: 1280,
		height: 800,
		// autoHideMenuBar: true,
		// fullscreen: true,
		icon: path.join(__dirname, "images", "Logo.ico"),
		webPreferences: {
			_nodeIntegration: true,
			get nodeIntegration() {
				return this._nodeIntegration;
			},
			set nodeIntegration(value) {
				this._nodeIntegration = value;
			},
			contextIsolation: false,
		},
	});

	// Load local HTML file
	if (station === "vitalsign" || station === "lab") {
		win.loadFile(path.join(__dirname, "src/index.html"), {
			search: `station=${encodeURIComponent(station)}`,
		});
	} else {
		win.loadFile(path.join(__dirname, "src/test.html"), {
			search: `station=${encodeURIComponent(station)}`,
		});
	}

	win.webContents.openDevTools();
}

app.whenReady().then(() => {
	// Enable auto-launch on Windows with persisted station argument
	try {
		app.setLoginItemSettings({
			openAtLogin: true,
			args: [`--station=${getStationArg()}`],
		});
	} catch (_) {}

	createWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
