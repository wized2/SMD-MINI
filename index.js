const express = require('express');
const app = express();
const config = require("./config.js");
const port = config.PORT || process.env.PORT || 20193;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pairRouter = require('./smd-mini');
app.use('/api', pairRouter);

app.use('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, './pair.html'));
});

app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
});

module.exports = app;
