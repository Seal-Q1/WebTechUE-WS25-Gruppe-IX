let express = require('express');

const app = express();

const pool = require('./pool.js');  // the database pool

let bodyParser = require('body-parser');
app.use(bodyParser.json()); // set content type as JSON

app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("it do be workin");
});

app.get("/users", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    pool.query('SELECT * FROM "users"').then((result) => res.status(200).send(result.rows));
});

let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);