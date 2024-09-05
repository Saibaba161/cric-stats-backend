const db = require('../models/db');

exports.searchPlayers = async (req, res, next) => {
  const { name } = req.query;
  try {
    const result = await db.query('SELECT * FROM players WHERE name ILIKE $1', [`%${name}%`]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getPlayerStats = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM players_stats WHERE player_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.comparePlayerStats = async (req, res, next) => {
  const { player1, player2, format } = req.query;
  try {
    const query = `
      SELECT p.name, ps.*
      FROM players p
      JOIN players_stats ps ON p.id = ps.player_id
      WHERE (p.name ILIKE $1 OR p.name ILIKE $2)
      AND ps.format = $3
    `;
    const result = await db.query(query, [`%${player1}%`,`%${player2}%`, format]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};