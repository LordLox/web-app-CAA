// web-app-CAA/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("./database");
const defaultGrid = require("./default-grid");
const simplifiedGrid = require("./default-grid-2");
const fetch = require("node-fetch");

const app = express();
// const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:3000";
const PORT = process.env.APP_PORT || 3000;
const HOST = process.env.APP_HOST || "localhost";
const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";
const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL || "http://localhost:5000";

console.log(`[STARTUP] Server configuration loaded:`);
console.log(`[STARTUP] - PORT: ${PORT}`);
console.log(`[STARTUP] - HOST: ${HOST}`);
console.log(`[STARTUP] - BACKEND_BASE_URL: ${BACKEND_BASE_URL}`);
console.log(`[STARTUP] - JWT_SECRET: ${JWT_SECRET ? "[SET]" : "[NOT SET]"}`);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(
      `[${timestamp}] Request body:`,
      JSON.stringify(req.body, null, 2),
    );
  }
  next();
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
console.log("[MIDDLEWARE] CORS configured with credentials and all origins");

app.use(express.json({ limit: "10mb" }));
console.log("[MIDDLEWARE] JSON parser configured with 10mb limit");

app.use(express.static("public"));
console.log("[MIDDLEWARE] Static files served from 'public' directory");

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  console.log(`[AUTH] Authenticating token for ${req.method} ${req.url}`);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("[AUTH] No token provided, returning 401");
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err || !user.userId) {
      console.log(
        `[AUTH] Token verification failed:`,
        err?.message || "No userId in token",
      );
      return res.sendStatus(403);
    }

    try {
      console.log(
        `[AUTH] Verifying user exists in database: userId=${user.userId}`,
      );
      const dbUser = await db.findUserById(user.userId);
      if (!dbUser) {
        console.log(`[AUTH] User not found in database: userId=${user.userId}`);
        return res.sendStatus(401);
      }
      console.log(
        `[AUTH] Authentication successful for user: ${user.username || user.userId}`,
      );
      req.user = user;
      next();
    } catch (dbError) {
      console.error("Database error during token authentication:", dbError);
      return res.sendStatus(500);
    }
  });
};

// --- Auth API Endpoints ---
// FIX: This endpoint now handles registration and initial setup together.
app.post("/api/register", async (req, res) => {
  console.log("[REGISTER] Registration attempt started");
  try {
    const { username, password, editorPassword, gridType } = req.body;
    console.log(
      `[REGISTER] Registration data received: username=${username}, gridType=${gridType}`,
    );

    if (!username || !password || !editorPassword || !gridType) {
      console.log("[REGISTER] Missing required fields in registration");
      return res.status(400).json({
        message:
          "Username, password, editor password, and gridType are required.",
      });
    }

    console.log(`[REGISTER] Checking if username already exists: ${username}`);
    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      console.log(`[REGISTER] Username already exists: ${username}`);
      return res.status(409).json({ message: "Username already exists." });
    }

    // 1. Create the user
    console.log(`[REGISTER] Creating new user: ${username}`);
    const newUser = await db.createUser(username, password, editorPassword);
    if (!newUser || !newUser.id) {
      console.log("[REGISTER] User creation failed in database");
      throw new Error("User creation failed in database.");
    }
    console.log(`[REGISTER] User created successfully: userId=${newUser.id}`);

    // 2. Determine the grid structure
    let selectedGrid;
    switch (gridType) {
      case "simplified":
        selectedGrid = simplifiedGrid;
        console.log("[REGISTER] Selected simplified grid");
        break;
      case "empty":
        selectedGrid = { home: [], systemControls: defaultGrid.systemControls };
        console.log("[REGISTER] Selected empty grid with system controls");
        break;
      default:
        selectedGrid = defaultGrid;
        console.log("[REGISTER] Selected default grid");
        break;
    }

    // 3. Save the grid for the new user
    console.log(`[REGISTER] Saving grid for user: userId=${newUser.id}`);
    await db.saveGrid(selectedGrid, newUser.id);

    const tokenPayload = { userId: newUser.id, username: username };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });
    console.log(`[REGISTER] JWT token generated for user: ${username}`);

    // The user status is sent as 'pending_setup'
    console.log(
      `[REGISTER] Registration completed successfully for user: ${username}`,
    );
    res.status(201).json({
      message: "User and grid created successfully.",
      token: token,
      status: "pending_setup",
    });
  } catch (error) {
    console.error("Error during registration and setup:", error);
    res
      .status(500)
      .json({ message: "Error registering user.", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  console.log("[LOGIN] Login attempt started");
  try {
    const { username, password } = req.body;
    console.log(`[LOGIN] Login attempt for username: ${username}`);

    const user = await db.findUserByUsername(username);
    if (!user) {
      console.log(`[LOGIN] User not found: ${username}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log(`[LOGIN] User found, verifying password for: ${username}`);
    const isMatch = await db.bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN] Password mismatch for user: ${username}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const tokenPayload = { userId: user.id, username: user.username };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });
    console.log(
      `[LOGIN] Login successful for user: ${username}, status: ${user.status}`,
    );

    // **FIX**: The user's status is now included in the response
    res.json({ token, status: user.status });
  } catch (error) {
    console.error("[LOGIN] Error during login:", error);
    res
      .status(500)
      .json({ message: "Error logging in.", error: error.message });
  }
});

app.post("/api/check-editor-password", authenticateToken, async (req, res) => {
  console.log(
    `[EDITOR-PASSWORD] Checking editor password for userId: ${req.user.userId}`,
  );
  try {
    const { password } = req.body;
    const isMatch = await db.checkEditorPassword(req.user.userId, password);
    console.log(
      `[EDITOR-PASSWORD] Editor password check result: ${isMatch ? "SUCCESS" : "FAILED"} for userId: ${req.user.userId}`,
    );
    res.json({ success: isMatch });
  } catch (error) {
    console.error("[EDITOR-PASSWORD] Error checking editor password:", error);
    res.status(500).json({
      message: "Error checking editor password.",
      error: error.message,
    });
  }
});

// --- Grid API Endpoints ---
app.post("/api/setup", authenticateToken, async (req, res) => {
  console.log(`[SETUP] Setup request started for userId: ${req.user.userId}`);
  try {
    const { gridType } = req.body;
    const userId = req.user.userId;
    console.log(
      `[SETUP] Grid type requested: ${gridType} for userId: ${userId}`,
    );

    let selectedGrid;
    switch (gridType) {
      case "simplified":
        selectedGrid = simplifiedGrid;
        console.log("[SETUP] Selected simplified grid");
        break;
      case "empty":
        selectedGrid = { home: [], systemControls: defaultGrid.systemControls }; // Empty with controls
        console.log("[SETUP] Selected empty grid with system controls");
        break;
      case "default":
      default:
        selectedGrid = defaultGrid;
        console.log("[SETUP] Selected default grid");
        break;
    }

    console.log(`[SETUP] Saving grid to database for userId: ${userId}`);
    await db.saveGrid(selectedGrid, userId);

    console.log(
      `[SETUP] Updating user status to 'active' for userId: ${userId}`,
    );
    await db.updateUserStatus(userId, "active"); // Update user status

    console.log(`[SETUP] Setup completed successfully for userId: ${userId}`);
    res.status(200).json({ message: "Setup complete. Grid saved." });
  } catch (error) {
    console.error("Error during setup:", error);
    res
      .status(500)
      .json({ message: "Error saving setup.", error: error.message });
  }
});

app.post("/api/complete-setup", authenticateToken, async (req, res) => {
  console.log(
    `[COMPLETE-SETUP] Completing setup for userId: ${req.user.userId}`,
  );
  try {
    await db.updateUserStatus(req.user.userId, "active");
    console.log(
      `[COMPLETE-SETUP] User status updated to 'active' for userId: ${req.user.userId}`,
    );
    res.status(200).json({ message: "User status updated to active." });
  } catch (error) {
    console.error("[COMPLETE-SETUP] Error updating user status:", error);
    res
      .status(500)
      .json({ message: "Error updating user status.", error: error.message });
  }
});

// GET the entire grid for a user.
app.get("/api/grid", authenticateToken, async (req, res) => {
  console.log(`[GET-GRID] Retrieving grid for userId: ${req.user.userId}`);
  try {
    const gridData = await db.getGrid(req.user.userId);
    console.log(
      `[GET-GRID] Grid retrieved successfully for userId: ${req.user.userId}, has data: ${!!gridData}`,
    );
    res.json(gridData || {}); // Send grid or empty object if it's a new/empty grid
  } catch (err) {
    console.error("Error reading from database:", err);
    res.status(500).send("Error reading from database.");
  }
});

// POST a full grid (This is now only for UPDATES from the client, not initial creation)
app.post("/api/grid", authenticateToken, async (req, res) => {
  console.log(`[SAVE-GRID] Saving grid for userId: ${req.user.userId}`);
  try {
    await db.saveGrid(req.body, req.user.userId);
    console.log(
      `[SAVE-GRID] Grid saved successfully for userId: ${req.user.userId}`,
    );
    res.status(200).json({ message: "Grid saved successfully!" });
  } catch (err) {
    console.error("Error writing to database:", err);
    res.status(500).send("Error saving to database.");
  }
});

// --- Granular Endpoints ---

// ADD a new item (symbol or category)
app.post("/api/grid/item", authenticateToken, async (req, res) => {
  console.log(`[ADD-ITEM] Adding new item for userId: ${req.user.userId}`);
  const { item, parentCategory } = req.body;
  console.log(
    `[ADD-ITEM] Item data:`,
    JSON.stringify({ item, parentCategory }, null, 2),
  );

  if (!item || !parentCategory) {
    console.log("[ADD-ITEM] Missing required fields: item or parentCategory");
    return res
      .status(400)
      .json({ message: "Item data and parent category are required." });
  }
  try {
    const newItem = await db.addItem(item, parentCategory, req.user.userId);
    console.log(
      `[ADD-ITEM] Item added successfully for userId: ${req.user.userId}:`,
      newItem,
    );
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item to database:", err);
    res.status(500).json({ message: "Error adding item.", error: err.message });
  }
});

// UPDATE an existing item
app.put("/api/grid/item/:id", authenticateToken, async (req, res) => {
  console.log(
    `[UPDATE-ITEM] Updating item ${req.params.id} for userId: ${req.user.userId}`,
  );
  console.log(`[UPDATE-ITEM] Update data:`, JSON.stringify(req.body, null, 2));
  try {
    const result = await db.updateItem(
      req.params.id,
      req.body,
      req.user.userId,
    );
    console.log(
      `[UPDATE-ITEM] Item updated successfully: ${req.params.id} for userId: ${req.user.userId}`,
    );
    res.status(200).json({ message: "Item updated successfully!", ...result });
  } catch (err) {
    console.error("Error updating item in database:", err);
    res
      .status(500)
      .json({ message: "Error updating item.", error: err.message });
  }
});

// DELETE an item (symbol or category)
app.delete("/api/grid/item/:id", authenticateToken, async (req, res) => {
  console.log(
    `[DELETE-ITEM] Deleting item ${req.params.id} for userId: ${req.user.userId}`,
  );
  const { categoryTarget } = req.body; // Sent if the deleted item is a category
  if (categoryTarget) {
    console.log(`[DELETE-ITEM] Category target specified: ${categoryTarget}`);
  }
  try {
    await db.deleteItem(req.params.id, req.user.userId);
    console.log(
      `[DELETE-ITEM] Item deleted: ${req.params.id} for userId: ${req.user.userId}`,
    );

    if (categoryTarget) {
      console.log(
        `[DELETE-ITEM] Deleting category contents for: ${categoryTarget}`,
      );
      await db.deleteCategoryContents(categoryTarget, req.user.userId);
      console.log(
        `[DELETE-ITEM] Category contents deleted for: ${categoryTarget}`,
      );
    }
    res.status(200).json({ message: "Item deleted successfully!" });
  } catch (err) {
    console.error("Error deleting item from database:", err);
    res
      .status(500)
      .json({ message: "Error deleting item.", error: err.message });
  }
});

// API ENDPOINT TO PROXY CONJUGATION REQUESTS TO THE PYTHON SERVICE
app.post("/api/conjugate", authenticateToken, async (req, res) => {
  console.log(
    `[CONJUGATE] Conjugation request from userId: ${req.user.userId}`,
  );
  try {
    // The request body will contain the sentence context and words to change

    // FIX: Extract 'tense' from the request body along with the other variables.
    const { sentence, words, base_forms, tense } = req.body;
    console.log(
      `[CONJUGATE] Request data:`,
      JSON.stringify({ sentence, words, base_forms, tense }, null, 2),
    );

    console.log(
      `[CONJUGATE] Forwarding request to AI service: ${BACKEND_BASE_URL}/conjugate`,
    );
    const aiServiceResponse = await fetch(`${BACKEND_BASE_URL}/conjugate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // FIX: Add the 'tense' variable to the body of the request being sent to the Python service.
      body: JSON.stringify({ sentence, words, base_forms, tense }),
    });

    console.log(
      `[CONJUGATE] AI service response status: ${aiServiceResponse.status}`,
    );
    if (!aiServiceResponse.ok) {
      throw new Error(
        `AI service responded with status: ${aiServiceResponse.status}`,
      );
    }

    const conjugations = await aiServiceResponse.json();
    console.log(
      `[CONJUGATE] AI service response received, returning conjugations to client`,
    );
    res.json(conjugations);
  } catch (err) {
    console.error("Error proxying to AI service:", err);
    res.status(500).send("Error communicating with the AI service.");
  }
});

// API ENDPOINT TO PROXY CORRECTION REQUESTS TO THE PYTHON SERVICE
app.post("/api/correct", authenticateToken, async (req, res) => {
  console.log(`[CORRECT] Correction request from userId: ${req.user.userId}`);
  try {
    const { sentence } = req.body;
    console.log(`[CORRECT] Sentence to correct: "${sentence}"`);

    console.log(
      `[CORRECT] Forwarding request to AI service: ${BACKEND_BASE_URL}/correct`,
    );
    const aiServiceResponse = await fetch(`${BACKEND_BASE_URL}/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
    });

    console.log(
      `[CORRECT] AI service response status: ${aiServiceResponse.status}`,
    );
    if (!aiServiceResponse.ok) {
      throw new Error(
        `AI service responded with status: ${aiServiceResponse.status}`,
      );
    }

    const correctedData = await aiServiceResponse.json();
    console.log(
      `[CORRECT] AI service response received, returning corrections to client`,
    );
    res.json(correctedData);
  } catch (err) {
    console.error("Error proxying to AI service for correction:", err);
    res.status(500).send("Error communicating with the AI service.");
  }
});

app.listen(PORT, HOST, () => {
  console.log(`[STARTUP] Server is running on http://${HOST}:${PORT}`);
  console.log(`[STARTUP] Server startup completed successfully`);
});
