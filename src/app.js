const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();
const path = require("path");
const httpStatus = require("http-status");
const morgan = require("./config/morgan");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
//const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const ApiError = require("../src/utils/ApiError");
const { errorHandler, errorConverter } = require("../src/middlewares/error");

const adminRoutes = require("./routes/index");
const superAdminRoutes = require("./routes/super-admin/index");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../src/docs/swagger.json");

const app = express();

app.use(compression());

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

// Serve the Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// enable cors
app.use(cors());
app.options("*", cors());

// parse json request body
app.use(express.json());

app.use(cookieParser());
app.get("/v1/admin", (req, res, next) => {
  // Show some content to the user
  let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  return res.status(200).json({ message: "OK" });
});

// Set the view engine to handlebars
app.engine(".hbs", exphbs.engine({ extname: ".hbs", defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Set the path to your email templates directory
app.set("views", path.join(__dirname, "views", "emails"));
app.use('/uploads', express.static('uploads'));

//admin routes
app.use("/v1/admin", adminRoutes);
app.use("/v2/admin", adminRoutes);
app.use("/v1/super-admin", superAdminRoutes);

app.use(express.static(path.join(__dirname, "/build")));
app.get("*", (req, res) => {
  // return res.status(200).json({
  //   message:"success!!"
  // })
  return res.sendFile(path.join(__dirname, "/build", "index.html"));
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorConverter);
// handle error
app.use(errorHandler);

module.exports = app;
