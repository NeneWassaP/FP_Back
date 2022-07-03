const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const db = require("./models");

const PORT = process.env.PORT || 3000;

//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/",(req,res) => {
    console.log(req.body);
    return res.json({ message: "Hello World" });
});

app.use("/user",require("./route/user"));

db.sequelize.sync().then((req) => {
    app.listen(PORT, () => console.log(`Backend started on port ${PORT}`))
});