const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron')
require('dotenv').config();

const {scrapePlayerStats} = require('./utils/scraper')

const playerRoutes = require('./routes/playerRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

app.use('/api/players', playerRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

cron.schedule('0 0 * * *', async () => {
    console.log('Running daily stats update');
    // Add a list of ESPN IDs you want to scrape regularly
    const playerIds = [253802, 35320];
    for (const id of playerIds) {
      await scrapePlayerStats(id);
    }
});