import express from "express";
const app = express();

app.get("/", (req, res) => res.send("dockpush — running locally! 🚀"));

app.listen(3000, () => console.log("App running at http://localhost:3000"));
