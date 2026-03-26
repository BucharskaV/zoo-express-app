const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require("connect-sqlite3")(session);
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new SQLiteStore({ db: ":memory:"}),
  secret: "the-most-cute-key",
  resave: false,
  saveUninitialized: false,

  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

const createTables = require('./db/create.js');
const insertData = require('./db/insert.js');

const userController = require('./controllers/userController');
const zookeeperController = require('./controllers/zookeeperController');
const animalController = require('./controllers/animalController');
const mealController = require('./controllers/mealController');
const foodController = require('./controllers/foodController');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/instruction', (req, res)=>{
  res.sendFile(path.join(__dirname, 'public', 'instructions.html'));
});

app.get('/register', userController);
app.get('/login', userController);
app.get('/logout', userController);
app.get('/register-zookeeper', userController);
app.post('/register', userController);
app.post('/login', userController);
app.post('/logout', userController);
app.post('/register-zookeeper', userController);

app.get('/zookeepers', zookeeperController);
app.get('/zookeepers/:id', zookeeperController);
app.get('/zookeepers/add', zookeeperController);
app.post('/zookeepers/add', zookeeperController);
app.get('/zookeepers/edit/:id', zookeeperController);
app.put('/zookeepers/:id', zookeeperController);
app.get('/zookeepers/delete/:id', zookeeperController);
app.post('/zookeepers/delete/:id', zookeeperController);

app.get('/animals', animalController);
app.get('/animals/:id', animalController);
app.get('/animals/add', animalController);
app.post('/animals/add', animalController);
app.get('/animals/edit/:id', animalController);
app.put('/animals/:id', animalController);
app.get('/animals/delete/:id', animalController);
app.post('/animals/delete/:id', animalController);

app.get('/food', foodController);
app.get('/food/:id', foodController);
app.get('/food/add', foodController);
app.post('/food/add', foodController);
app.get('/food/edit/:id', foodController);
app.put('/food/:id', foodController);
app.get('/food/delete/:id', foodController);
app.post('/food/delete/:id', foodController);

app.get('/meals', mealController);
app.get('/meals/:animal_id', mealController);
app.get('/meals/:animal_id/:food_id', mealController);
app.get('/meals/add', mealController);
app.post('/meals/add', mealController);
app.get('/meals/edit/:old_animal_id/:old_food_id', mealController);
app.put('/meals/:old_animal_id/:old_food_id', mealController);
app.get('/meals/delete/:animal_id/:food_id', mealController);
app.post('/meals/delete/:animal_id/:food_id', mealController);

app.use((err, req, res, next) => {
  res.status(err.status).render('error', { message: err.message });
});

const PORT = 3000;
createTables((err) => {
  if (err) return console.error('Creation script error:', err);
  insertData((err2) => {
    if (err2) return console.error('Insert script error:', err2);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
});