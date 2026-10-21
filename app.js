const express = require("express");
const { router: ordersRouter, validationProblem } = require("./src/routes");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_VERSION = "1.0";

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

// Kept outside the orders router so it stays useful for diagnostics.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: API_VERSION,
  });
});

app.use("/orders", ordersRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
    },
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json(
      validationProblem("Invalid JSON body", [
        "Request body must contain valid JSON",
      ]),
    );
  }

  console.error(error);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    },
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Orders API is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
