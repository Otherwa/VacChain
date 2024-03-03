const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const { connect } = require('./db/db.cjs');

const loginRouter = require('./routes/loginRouter.cjs');
const registerRouter = require('./routes/registerRouter.cjs');
const dashboardRouter = require('./routes/dashboardRouter.cjs');
const certificatesRouter = require('./routes/certificatesRouter.cjs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'Tatakae',
        resave: false,
        saveUninitialized: true,
    })
);

connect();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up routes
app.use('/user/', loginRouter);
app.use('/user/', registerRouter);
app.use('/user/', dashboardRouter);
app.use('/user/', certificatesRouter);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.send('This is the about page!');
});



module.exports = { app }
