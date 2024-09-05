const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models/db');

async function scrapePlayerStats(espnId) {
  const url = `https://www.espncricinfo.com/cricketers/virat-kohli-${espnId}`;
  
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Extract player info
    const name = $('h1.player-card-name').text().trim();
    const country = $('h3.player-card-country').text().trim();
    
    // Extract batting stats
    const battingStats = {};
    $('table.table-with-pagination-player-stats').first().find('tr').each((i, el) => {
      const format = $(el).find('td').first().text().trim();
      const matches = $(el).find('td').eq(1).text().trim();
      const runs = $(el).find('td').eq(2).text().trim();
      const average = $(el).find('td').eq(5).text().trim();
      
      battingStats[format] = { matches, runs, average };
    });
    
    // Save to database
    await savePlayerStats(espnId, name, country, battingStats);
    
    console.log(`Successfully scraped and saved stats for ${name}`);
  } catch (error) {
    console.error(`Error scraping player ${espnId}:`, error);
  }
}

async function savePlayerStats(espnId, name, country, stats) {
  // First, insert or update player info
  const playerQuery = `
    INSERT INTO players (espn_id, name, country)
    VALUES ($1, $2, $3)
    ON CONFLICT (espn_id) DO UPDATE
    SET name = EXCLUDED.name, country = EXCLUDED.country
    RETURNING id;
  `;
  const playerResult = await db.query(playerQuery, [espnId, name, country]);
  const playerId = playerResult.rows[0].id;

  // Then, insert or update stats for each format
  for (const [format, formatStats] of Object.entries(stats)) {
    const statsQuery = `
      INSERT INTO player_stats (player_id, format, matches, runs, average)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (player_id, format) DO UPDATE
      SET matches = EXCLUDED.matches, runs = EXCLUDED.runs, average = EXCLUDED.average;
    `;
    await db.query(statsQuery, [
      playerId,
      format,
      parseInt(formatStats.matches),
      parseInt(formatStats.runs),
      parseFloat(formatStats.average)
    ]);
  }
}

module.exports = { scrapePlayerStats };