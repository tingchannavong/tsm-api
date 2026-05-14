import express from "express";
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import cors from "cors";
import notFound from "./middlewares/notFound.middleware.js";
import locationRoutes from "./routes/location.routes.js";
import orderRoutes from "./routes/order.routes.js";
import pricingRoutes from "./routes/pricing.routes.js";

const app = express(); 
const PORT = process.env.PORT;

console.log("Hit the route!");

app.use(cors({
    origin: "http://localhost:5173", // to let app accept request from this host
    credentials: true // to accept refresh token
})
);

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/locations', locationRoutes);
app.use('/api/pricings', pricingRoutes);

app.get('/', (re, res) => {
    res.send('welcome to backend API, prisma & JWT login project v0.1.0');
});

app.use(notFound);

// throw error handler for all routes
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});

