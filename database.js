// web-app CAA/database.js
const { Sequelize, DataTypes } = require("sequelize");
const sharp = require("sharp");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { exit } = require("process");

// Database configuration
const DB_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DB_DIR, "database.sqlite");

// Create database directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log("Created database directory:", DB_DIR);
}

// Initialize Sequelize with support for both SQLite and MariaDB
let sequelize;
if (process.env.DB_TYPE === "mariadb") {
  sequelize = new Sequelize(
    process.env.DB_NAME || "caa_database",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      dialect: "mariadb",
      logging: console.log,
    },
  );
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: DB_PATH,
    logging: console.log,
  });
}

// Define User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    editor_password: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending_setup",
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

// Define GridItem model
const GridItem = sequelize.define(
  "GridItem",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },
    parent_category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_order: {
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.TEXT,
    },
    color: {
      type: DataTypes.STRING,
    },
    target: {
      type: DataTypes.STRING,
    },
    text: {
      type: DataTypes.TEXT,
    },
    speak: {
      type: DataTypes.TEXT,
    },
    action: {
      type: DataTypes.STRING,
    },
    is_visible: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    symbol_type: {
      type: DataTypes.STRING,
    },
    is_visible: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "grid_items",
    timestamps: false,
  },
);

// Define associations
User.hasMany(GridItem, { foreignKey: "user_id", onDelete: "CASCADE" });
GridItem.belongsTo(User, { foreignKey: "user_id" });

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database.");

    // Enable foreign keys for SQLite
    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query("PRAGMA foreign_keys = ON;");
    }

    await sequelize.sync();
    console.log("Database tables synchronized.");
  } catch (error) {
    console.error("Error connecting to database:", error);
    exit(1);
  }
}

initializeDatabase();

// --- User Functions ---
const findUserByUsername = async (username) => {
  console.log(`Finding user by username: ${username}`);
  try {
    const user = await User.findOne({ where: { username } });
    console.log("User found:", user ? "Yes" : "No");
    return user;
  } catch (error) {
    console.error("Error finding user by username:", error);
    throw error;
  }
};

const findUserById = async (id) => {
  console.log(`Finding user by ID: ${id}`);
  try {
    const user = await User.findOne({
      where: { id },
      attributes: ["id", "username"],
    });
    console.log("User found:", user ? `${user.username}` : "No");
    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

const createUser = async (username, password, editorPassword) => {
  console.log(`Creating user: ${username}`);
  try {
    const saltRounds = 10;
    console.log("Hashing passwords...");
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedEditorPassword = await bcrypt.hash(editorPassword, saltRounds);

    const user = await User.create({
      username,
      password: hashedPassword,
      editor_password: hashedEditorPassword,
    });

    console.log(`User created with ID: ${user.id}`);
    return { id: user.id };
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

const checkEditorPassword = async (userId, password) => {
  console.log(`Checking editor password for user ID: ${userId}`);
  try {
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["editor_password"],
    });

    if (!user) {
      console.log("User not found for editor password check");
      return false;
    }

    const isMatch = await bcrypt.compare(password, user.editor_password);
    console.log("Editor password match:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error checking editor password:", error);
    throw error;
  }
};

const updateUserStatus = async (userId, status) => {
  console.log(`Updating user status for ID ${userId} to: ${status}`);
  try {
    const [affectedRows] = await User.update(
      { status },
      { where: { id: userId } },
    );
    console.log(`User status updated, changes: ${affectedRows}`);
    return { changes: affectedRows };
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// --- Image Processing ---
async function processImage(base64String) {
  console.log("Processing image...");
  try {
    const buffer = Buffer.from(base64String.split(",")[1], "base64");
    console.log(`Processing image buffer of size: ${buffer.length}`);
    const optimizedBuffer = await sharp(buffer)
      .resize(200, 200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    console.log(`Image optimized to size: ${optimizedBuffer.length}`);
    return `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error processing image:", error);
    return base64String;
  }
}

// --- Grid Functions ---
async function saveGrid(gridData, userId) {
  console.log(`Saving grid for user ID: ${userId}`);
  try {
    const transaction = await sequelize.transaction();

    try {
      console.log(`Deleting existing grid items for user ID: ${userId}`);
      await GridItem.destroy({
        where: { user_id: userId },
        transaction,
      });

      const processingPromises = [];
      let totalItems = 0;

      for (const categoryKey in gridData) {
        console.log(
          `Processing category: ${categoryKey} with ${gridData[categoryKey].length} items`,
        );

        for (let index = 0; index < gridData[categoryKey].length; index++) {
          const item = gridData[categoryKey][index];
          let iconData = item.icon;

          const itemToInsert = {
            id: item.id,
            user_id: userId,
            parent_category: categoryKey,
            item_order: index,
            type: item.type,
            label: item.label,
            icon: iconData,
            color: item.color,
            target: item.target || null,
            text: item.text || null,
            speak: item.speak || null,
            action: item.action || null,
            is_visible: item.is_visible === false ? 0 : 1,
            symbol_type: item.symbol_type || null,
            is_visible: item.is_visible === false ? 0 : 1,
          };

          if (iconData && iconData.startsWith("data:image/")) {
            console.log(`Processing image for item: ${item.id}`);
            const promise = processImage(iconData).then(
              async (optimizedIcon) => {
                itemToInsert.icon = optimizedIcon;
                await GridItem.create(itemToInsert, { transaction });
              },
            );
            processingPromises.push(promise);
          } else {
            await GridItem.create(itemToInsert, { transaction });
          }
          totalItems++;
        }
      }

      console.log(`Total items to save: ${totalItems}`);
      await Promise.all(processingPromises);

      await transaction.commit();
      console.log("Grid saved successfully");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error saving grid:", error);
    throw error;
  }
}

// OPTIMIZED: This function now ensures all categories, even empty ones, are initialized.
async function getGrid(userId) {
  console.log(`Getting grid for user ID: ${userId}`);
  try {
    const rows = await GridItem.findAll({
      where: { user_id: userId },
      order: [
        ["parent_category", "ASC"],
        ["item_order", "ASC"],
      ],
    });

    if (rows.length === 0) {
      console.log("No grid items found for user");
      return null;
    }

    console.log(`Found ${rows.length} grid items`);
    const gridData = {};

    // First pass: populate gridData with items from the database.
    rows.forEach((row) => {
      if (!gridData[row.parent_category]) {
        gridData[row.parent_category] = [];
        console.log(`Initialized category: ${row.parent_category}`);
      }
      const item = {
        id: row.id,
        type: row.type,
        label: row.label,
        icon: row.icon,
        color: row.color,
        target: row.target,
        text: row.text,
        speak: row.speak,
        action: row.action,
        is_visible: row.is_visible === 1,
        symbol_type: row.symbol_type,
        is_visible: row.is_visible === 1,
      };
      gridData[row.parent_category].push(item);
    });

    // Second pass: ensure every category target has an array, even if it's empty.
    // This prevents the "cannot read properties of undefined (reading 'push')" error on the client.
    rows.forEach((row) => {
      if (row.type === "category" && row.target && !gridData[row.target]) {
        console.log(`Initializing empty category target: ${row.target}`);
        gridData[row.target] = [];
      }
    });

    console.log(
      `Grid retrieved with ${Object.keys(gridData).length} categories`,
    );
    return gridData;
  } catch (error) {
    console.error("Error getting grid:", error);
    throw error;
  }
}

async function addItem(itemData, parentCategory, userId) {
  console.log(
    `Adding item ${itemData.id} to category ${parentCategory} for user ${userId}`,
  );

  if (itemData.icon && itemData.icon.startsWith("data:image/")) {
    console.log("Processing image for new item");
    itemData.icon = await processImage(itemData.icon);
  }

  try {
    const maxOrderRow = await GridItem.findOne({
      where: {
        parent_category: parentCategory,
        user_id: userId,
      },
      attributes: [
        [sequelize.fn("MAX", sequelize.col("item_order")), "max_order"],
      ],
    });

    const newOrder =
      maxOrderRow && maxOrderRow.dataValues.max_order !== null
        ? maxOrderRow.dataValues.max_order + 1
        : 0;
    console.log(`New item order: ${newOrder}`);

    const createdItem = await GridItem.create({
      id: itemData.id,
      user_id: userId,
      parent_category: parentCategory,
      item_order: newOrder,
      type: itemData.type,
      label: itemData.label,
      icon: itemData.icon,
      color: itemData.color,
      target: itemData.target || null,
      text: itemData.text || null,
      speak: itemData.speak || null,
      action: itemData.action || null,
      is_visible: itemData.is_visible === false ? 0 : 1,
      symbol_type: itemData.symbol_type || null,
      is_visible: itemData.is_visible === false ? 0 : 1,
    });

    console.log(`Item added successfully: ${itemData.id}`);
    return { id: itemData.id, icon: itemData.icon };
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
}

async function updateItem(itemId, itemData, userId) {
  console.log(`Updating item ${itemId} for user ${userId}`);

  if (itemData.icon && itemData.icon.startsWith("data:image/")) {
    console.log("Processing image for item update");
    itemData.icon = await processImage(itemData.icon);
  }

  const fields = [
    "label",
    "icon",
    "color",
    "target",
    "text",
    "speak",
    "action",
    "is_visible",
    "symbol_type",
    "is_visible",
  ];

  const updateData = {};
  for (const field of fields) {
    if (itemData.hasOwnProperty(field)) {
      updateData[field] = itemData[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    console.log("No fields to update for item");
    return { message: "No fields to update." };
  }

  console.log(`Updating fields: ${Object.keys(updateData).join(", ")}`);

  try {
    const [affectedRows] = await GridItem.update(updateData, {
      where: {
        id: itemId,
        user_id: userId,
      },
    });

    if (affectedRows === 0) {
      console.log("Item not found or user not authorized for update");
      throw new Error("Item not found or user not authorized.");
    }

    console.log(`Item updated successfully, changes: ${affectedRows}`);
    return { changes: affectedRows, updatedIcon: itemData.icon };
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
}

async function deleteItem(itemId, userId) {
  console.log(`Deleting item ${itemId} for user ${userId}`);
  try {
    const deletedRows = await GridItem.destroy({
      where: {
        id: itemId,
        user_id: userId,
      },
    });

    if (deletedRows === 0) {
      console.log("Item not found or user not authorized for deletion");
      throw new Error("Item not found or user not authorized.");
    }

    console.log(`Item deleted successfully, changes: ${deletedRows}`);
    return { changes: deletedRows };
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}

async function deleteCategoryContents(categoryTarget, userId) {
  console.log(
    `Deleting contents of category ${categoryTarget} for user ${userId}`,
  );
  try {
    const deletedRows = await GridItem.destroy({
      where: {
        parent_category: categoryTarget,
        user_id: userId,
      },
    });

    console.log(`Category contents deleted, changes: ${deletedRows}`);
    return { changes: deletedRows };
  } catch (error) {
    console.error("Error deleting category contents:", error);
    throw error;
  }
}

// New endpoint for optimized reordering
async function updateOrder(orderedIds, parentCategory, userId) {
  console.log(
    `Updating order for ${orderedIds.length} items in category ${parentCategory} for user ${userId}`,
  );

  try {
    const transaction = await sequelize.transaction();

    try {
      const updatePromises = orderedIds.map((id, index) => {
        return GridItem.update(
          { item_order: index },
          {
            where: {
              id: id,
              parent_category: parentCategory,
              user_id: userId,
            },
            transaction,
          },
        );
      });

      await Promise.all(updatePromises);
      await transaction.commit();

      console.log("Order updated successfully");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  bcrypt,
  saveGrid,
  getGrid,
  addItem,
  updateItem,
  deleteItem,
  deleteCategoryContents,
  updateOrder,
  updateUserStatus,
  checkEditorPassword,
};
