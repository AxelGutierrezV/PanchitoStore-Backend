require("dotenv").config();

const app = require("./app");

const PORT =
  process.env.PORT || 3080;

app.listen(PORT, () => {

  console.log(
    `Notification Service running on ${PORT}`
  );

});