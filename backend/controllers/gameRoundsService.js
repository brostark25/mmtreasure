import axios from "axios";
import csvParser from "csv-parser";
import pLimit from "p-limit";
import { connectToDatabase } from "../config/db.js";

const db = await connectToDatabase();

// Function to check if data exists for a given playSessionID
const checkDataExists = async (playSessionID) => {
  try {
    const [rows] = await db.query('SELECT * FROM winlose WHERE playSessionID = ?', [playSessionID]);
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking data existence:", error.message);
    throw error;
  }
};

// Function to insert data into the database
const insertData = async (data) => {
  if (data.length === 0) {
    console.log("No data to insert.");
    return;
  }

  // Log the data for debugging
  console.log("Data to insert:", JSON.stringify(data, null, 2));

  const sql = `INSERT IGNORE INTO winlose (playerID, timepoint, playSessionID, gameID, beforeamt, betamt, winamt, startdate, enddate, provider, status) VALUES ?`;
  const values = data.map(row => [
    row.playerID || null, // extPlayerID
    row.timepoint || null, // Use the timepoint from the data
    row.playSessionID || null,
    row.gameID || null,
    row.beforeamt || 0, // Calculate beforeamt as balance + bet - win
    parseFloat(row.bet) || 0, // bet maps to betamt
    parseFloat(row.win) || 0, // win maps to winamt
    row.startDate ? new Date(row.startDate).toISOString().slice(0, 19).replace('T', ' ') : null,
    row.endDate ? new Date(row.endDate).toISOString().slice(0, 19).replace('T', ' ') : null,
    'Pragmatic Play', // Default provider
    row.status || null,
  ]);

  try {
    await db.query(sql, [values]);
    console.log(`Inserted ${data.length} rows into the database.`);
  } catch (error) {
    console.error("Error inserting data into the database:", error.message);
    throw error;
  }
};

// Define the options parameter
const options = "addBalance";

const fetchGameRounds = async (login, password, timepoint, retries = 3, delay = 1000) => {
  try {
    const url = `https://api.prerelease-env.biz/IntegrationService/v3/DataFeeds/gamerounds/?login=${encodeURIComponent(
      login
    )}&password=${encodeURIComponent(password)}&timepoint=${timepoint}&options=${options}`;

    console.log(`Fetching URL: ${url}`);

    const response = await axios.get(url, { responseType: "stream" });

    const results = [];
    return new Promise((resolve, reject) => {
      response.data
        .pipe(csvParser())
        .on("data", (row) => {
          if (row["_1"] && row["_1"] !== "extPlayerID") {
            // Map CSV fields to database schema
            const mappedRow = {
              playerID: row["_1"], // extPlayerID
              gameID: row["_2"], // gameID
              playSessionID: row["_3"], // playSessionID
              timepoint: timepoint, // Use the provided timepoint
              startDate: row["_5"], // startDate
              endDate: row["_6"], // endDate
              bet: parseFloat(row["_9"]) || 0, // bet maps to betamt
              win: parseFloat(row["_10"]) || 0, // win maps to winamt
              balance: parseFloat(row["_13"]) || 0 // balance maps to balance
            };
            // Calculate beforeamt as balance + bet - win
            mappedRow.beforeamt = Math.abs(mappedRow.balance + mappedRow.bet - mappedRow.win);
            mappedRow.status = mappedRow.win > 0 ? "Settled" : "Bet";
            results.push(mappedRow); // Push only once
          }
        })
        .on("end", async () => {
          console.log(`Data fetched for timepoint=${timepoint}, Rows: ${results.length}`);

          // Filter out rows where both win and bet are 0
          const filteredResults = results.filter(row => row.bet !== 0 || row.win !== 0);

          // Deduplicate data based on playSessionID
          const uniqueResults = [];
          const seenPlaySessionIDs = new Set();
          for (const row of filteredResults) {
            if (!seenPlaySessionIDs.has(row.playSessionID)) {
              seenPlaySessionIDs.add(row.playSessionID);
              uniqueResults.push(row);
            } else {
              console.log(`Duplicate playSessionID skipped: ${row.playSessionID}`);
            }
          }

          // Filter out rows that already exist in the database
          const newResults = [];
          for (const row of uniqueResults) {
            const exists = await checkDataExists(row.playSessionID);
            if (!exists) {
              newResults.push(row);
            } else {
              console.log(`Data already exists for playSessionID=${row.playSessionID}`);
            }
          }

          // Sort the data by playSessionID in ascending order
		  newResults.sort((a, b) => a.playSessionID - b.playSessionID);


          // Insert only new data into the database
          await insertData(newResults);
          resolve(newResults);
        })
        .on("error", (error) => {
          console.error("Error parsing CSV:", error.message);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`API Request Failed for timepoint=${timepoint}:`, error.message);

    if (retries > 0) {
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((res) => setTimeout(res, delay));
      return fetchGameRounds(login, password, timepoint, retries - 1, delay * 2);
    }

    return [];
  }
};

const fetchAllGameRounds = async (login, password, startTime, endTime) => {
  const interval = 10 * 60 * 1000; // 10 minutes in milliseconds
  const timepoints = [];
  for (let timepoint = startTime; timepoint <= endTime; timepoint += interval) {
    timepoints.push(timepoint);
  }

  // Limit concurrency to 5 requests at a time
  const limit = pLimit(5);

  const fetchPromises = timepoints.map((timepoint) =>
    limit(() => fetchGameRounds(login, password, timepoint).catch(error => {
      console.error(`Error fetching data for timepoint=${timepoint}:`, error.message);
      return []; // Return empty array on error to avoid breaking Promise.all
    }))
  );

  const results = await Promise.all(fetchPromises);
  return results.flat();
};

export { fetchAllGameRounds };

// Function to fetch game rounds data from the database
export const fetchGameRoundsFromDB = async (startTime, endTime) => {
  try {
    const sql = `
      SELECT * FROM winlose
      WHERE startdate >= ? AND enddate <= ?
      ORDER BY startdate ASC
    `;
    const [rows] = await db.query(sql, [new Date(startTime).toISOString().slice(0, 19).replace('T', ' '), new Date(endTime).toISOString().slice(0, 19).replace('T', ' ')]);
    return rows;
  } catch (error) {
    console.error("Error fetching data from the database:", error.message);
    throw error;
  }
};