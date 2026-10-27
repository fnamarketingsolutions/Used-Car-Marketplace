import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import cityRoutes from "./routes/city.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import stateRoutes from "./routes/state.routes.js";
import makeRoutes from "./routes/make.routes.js";
import modelRoutes from "./routes/model.routes.js";
import usedCarsRoutes from "./routes/usedCars.routes.js";
import reportRoutes from "./routes/report.routes.js";
import cmsRoutes from "./routes/cms.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/makes", makeRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/used-cars", usedCarsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
