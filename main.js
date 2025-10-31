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
        const appDataFile = path.join(app.getPath("appData"), "Display Checkup", "station.txt");
        if (fs.existsSync(appDataFile)) {
            return fs.readFileSync(appDataFile, "utf8").trim();
        }
    } catch (_) {}
    return null;
}

function getStationArg() {
	try {
		const arg = (process.argv || []).find((a) => a.startsWith("--station="));
		if (arg) return arg.split("=")[1];
		if (process.env.STATION) return process.env.STATION;
		const fromFile = readStationFromConfig();
		if (fromFile) return fromFile;
	} catch (_) {}
	return "vitalsign";
}

function createWindow() {
    const station = getStationArg();
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        autoHideMenuBar: true,
        fullscreen: true,
        icon: path.join(__dirname, "images", "Logo.ico"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

	// Load local HTML file
	win.loadFile(path.join(__dirname, "index.html"), {
		search: `station=${encodeURIComponent(station)}`,
	});
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
