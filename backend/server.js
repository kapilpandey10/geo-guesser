// server.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GeoGuesser API is running!');
});

app.get('/random-location', (req, res) => {
  const getRandomCoordinate = (min, max) => Math.random() * (max - min) + min;

  const randomLatitude = getRandomCoordinate(-85, 85);
  const randomLongitude = getRandomCoordinate(-180, 180);

  res.json({
    latitude: randomLatitude,
    longitude: randomLongitude,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
