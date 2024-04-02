import express from "express";
const app = express();
app.get('/', (req, res) => {
    res.send("Hello world again");
});
app.listen("5500", () => console.log("Listening on port 3000"));
