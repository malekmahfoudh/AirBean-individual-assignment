const express = require("express");
const NeDB = require("nedb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* ---- MIDDLEWARE IMPORTS ---- */
const { authenticateToken, isAdmin } = require("./middlewares/middleware");

const app = express();
app.use(express.json());

/* ---- DATABASES ---- */
const usersDB = new NeDB({ filename: "users.db", autoload: true });
const menuDB = new NeDB({ filename: "menu.db", autoload: true });
const campaignDB = new NeDB({ filename: "campaign.db", autoload: true });

/* ---- SIGNUP ROUTE ---- */
app.post("/api/signup", (req, res) => {
  const { username, password, role } = req.body;

  // checking if username exists in the DB using the findOne method
  usersDB.findOne({ username }, (existingUser) => {
    if (existingUser) {
      res.status(409).json({
        // if user already exists, return error message
        error:
          "Looks like this username is already taken! Try being more original, dude!! ",
      });
    } else {
      // using bcrypt to hash password if username is unique
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          res.status(500).json({ error: "Internal server error" });
        } else {
          //passed username, password and role creates new user with hashed password
          const newUser = {
            username,
            password: hashedPassword,
            role,
          };
          usersDB.insert(newUser, (err, user) => {
            if (err) {
              res.status(500).json({ error: "Internal server error" });
            } else {
              res.status(201).json(user);
            }
            // if everything is passed and processed correctly
            // the admin user has been created and inserted into
            // the users database (usersDB)
          });
        }
      });
    }
  });
});

/* ---- LOGIN ROUTE ---- */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // checking if username exists in the DB using the findOne method
  usersDB.findOne({ username }, (err, user) => {
    if (!user) {
      res
        .status(401)
        .json({
          error:
            "Simmer down cowboy! Either this aint the right username or it doesn't exist. Try again!  ",
        });
    } else {
      // if username exists, the password gets compared
      // with the hashed password belonging to the user using the ".compare" method
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const payload = {
            user: {
              username: user.username,
              role: user.role,
            },
          };

          const token = jwt.sign(payload, "key", { expiresIn: "1h" });

          res.status(200).json({ token });
        } else {
          res.status(401).json({ error: "Wrong password, buddy boy!" });
        }
      });
    }
  });
});

/* ---- ADD MENU ITEM ROUTE ---- */
app.post("/api/additem", authenticateToken, isAdmin, (req, res) => {
    // forgot to put "authenticateToken" every time i built a route
    // where is authentication is required. Almost had a total break down over
    // a simple misstake. Hope i learnt from it... 
    
    // "authenticateToken" middleware is used to make sure that the 
    // current user is an admin 
    // through the "isAdmin" middleware
  const { id, title, desc, price } = req.body;
  const createdAt = new Date().toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm", // <--- this one was a pain to get right
    // its formatting the timestamp to the swedish standard and sets the timezone
    // to Europe/Stockholm
  });

  // new product gets created and gets a "createdAt" value  
  const newProduct = {
    id,
    title,
    desc,
    price,
    createdAt,
  };

  menuDB.insert(newProduct, (err, product) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(201).json(product); // if everything is right the product should show up
    }
  });
});

/* ---- UPDATE MENU ITEM ROUTE ---- */
app.put("/api/updateitem/:id", authenticateToken, isAdmin, (req, res) => {
  const { title, desc, price } = req.body;
  const modifiedAt = new Date().toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
  });

  // using product 'id' (not to be confused with '_id') to allow updating 
  // title, desc and/or price for the chosen product (id)
  menuDB.update(
    { id: req.params.id },
    { $set: { title, desc, price, modifiedAt } },
    {},
    (err, updatedProduct) => {
      if (err || updatedProduct === 0) {
        res.status(404).json({ err, message: "Either this product does not exist or you didn't update it. Try again" });
      } else {
        res.status(200).json({ message: "Great success! Menu item updated!" });
      }
    }
  );
});

/* ---- DELETE MENU ITEM ---- */
app.delete("/api/deleteitem/:id", authenticateToken, isAdmin, (req, res) => {
  const productId = req.params.id;

  menuDB.remove({ id: productId }, {}, (err, numRemoved) => {
    if (err || numRemoved === 0) {
      res.status(404).json({ error: "Not found. Try the starbucks down the street.." });
    } else {
      res.status(200).json({ message: "And poof... this product has been deleted!" });
    }
  });
});

/* ---- CAMPAIGN ROUTE ---- */
app.post("/api/campaign", (req, res) => {
  const { products, campaignPrice } = req.body;

  // filtering the products with the ".filter()" method to filter out invalid products
  const invalidProducts = products.filter((product) => {
    return !menuDB.findOne({ title: product });
  });

  // if there are invalid products, error 400 will be returned indicating that the products are invalid. 
  if (invalidProducts.length > 0) {
    return res.status(400).json({ error: "These aren't the products you're looking for..(Invalid products)" });
  }

  // this is to make sure the price is actually a number and higher than 0.
  if (!Number.isFinite(campaignPrice) || campaignPrice <= 0) {
    return res.status(400).json({ error: "The price ain't right (maby not even a number. Try again)" });
  }

  const newCampaign = {
    products,
    campaignPrice,
  };

  // a "new" product is created as a campaign product. 
  campaignDB.insert(newCampaign, (err, campaign) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(201).json(campaign);
  });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
