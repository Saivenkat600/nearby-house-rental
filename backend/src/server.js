require("dotenv").config();
const app = require("./app");
const connectDatabase = require("./config/db");

const port = Number(process.env.PORT || 5000);

async function startServer() {
  await connectDatabase();
  app.listen(port, () => console.log(`Nearby House Rental API listening on port ${port}`));
}

startServer().catch((error) => {
  console.error(`Unable to start server: ${error.message}`);
  process.exit(1);
});
