const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AUPP LMS DevOps API - Updated by Developer 2");
});

app.get("/courses", (req, res) => {
  res.json([
    {
      id: 1,
      course: "Cloud Automation Final Version"
    },
    {
      id: 2,
      course: "DevOps"
    }
  ]);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AUPP LMS API running on port ${PORT}`);
});