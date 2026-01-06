let express = require('express');
let cors = require('cors')
const app = express();

const pool = require('./pool.js');  // the database pool

let bodyParser = require('body-parser');
app.use(bodyParser.json()); // set content type as JSON
app.use(cors());
app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("it do be workin");
});

app.get("/api/users", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    pool.query('SELECT * FROM "users"').then((result) => res.status(200).send(result.rows));
});

//FIXME these are placeholders (they do not even filter correctly)
app.get("/api/restaurant/:restaurantId/orders", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const query = `
        SELECT order_id     as id,
               order_name   as name,
               order_type   as type,
               order_status as status,
               address_street,
               address_house_nr,
               address_postal_code,
               address_city,
               address_door,
               paid_amount,
               payment_method,
               coupon_id,
               user_id,
               created_at
        FROM "order"
        ORDER BY created_at DESC
    `;
    pool.query(query).then((result) => res.status(200).send(result.rows));
});
app.get("/api/orders/:orderId/items", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const orderId = parseInt(req.params.orderId);
    const query = `
        SELECT order_item_id as id,
               item_id,
               quantity,
               unit_price
        FROM order_item
        WHERE order_id = $1
    `;
    pool.query(query, [orderId]).then((result) => res.status(200).send(result.rows));
});
app.get("/api/menu-items/:itemId", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const itemId = parseInt(req.params.itemId);
    const query = `
        SELECT item_id as id,
               item_name,
               item_price,
               item_description
        FROM menu_item
        WHERE item_id = $1
          AND is_deleted = FALSE
    `;
    pool.query(query, [itemId]).then((result) => res.status(200).send(result.rows[0]));
});

let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:" + port);