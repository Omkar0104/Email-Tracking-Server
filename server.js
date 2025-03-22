const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const TRACKING_LOG_FILE = "tracking.json";

// Ensure tracking log file exists
if (!fs.existsSync(TRACKING_LOG_FILE)) {
  fs.writeFileSync(TRACKING_LOG_FILE, "[]");
}

// 📩 Track Email Open Events
app.get("/track", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("Missing email parameter.");
  }

  console.log(`📩 Email Opened: ${email} at ${new Date().toISOString()}`);

  // Read current tracking data
  const logs = JSON.parse(fs.readFileSync(TRACKING_LOG_FILE, "utf8"));

  // Check if this email has already been tracked
  const existingEntry = logs.find((entry) => entry.email === email);
  if (existingEntry) {
    existingEntry.openedAt = new Date().toISOString();
  } else {
    logs.push({ email, openedAt: new Date().toISOString() });
  }

  // Save updated tracking data
  fs.writeFileSync(TRACKING_LOG_FILE, JSON.stringify(logs, null, 2));

  // Serve a 1x1 transparent pixel
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(__dirname, "pixel.png"));
});

// 🕵️‍♂️ API to Check Who Opened the Email
app.get("/check-opens", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(TRACKING_LOG_FILE, "utf8"));
  res.json(logs);
});

// 🚀 Start Server
app.listen(PORT, () => console.log(`📊 Tracking server running on port ${PORT}`));
