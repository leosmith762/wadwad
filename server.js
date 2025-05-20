
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Website running at http://0.0.0.0:${port}`);
});
