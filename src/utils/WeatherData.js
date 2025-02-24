import pool from '@/lib/db';

class WeatherData {
  async clearAndInsertWeatherData(weatherData) {
    let connection;
    try {
      connection = await pool.getConnection(); // Get a connection from the pool

      // Delete existing weather data from the table
      const deleteQuery = 'DELETE FROM forecast_data';
      await connection.query(deleteQuery);
      console.log('Existing weather data cleared.');

      // Insert the new weather data
      const insertQuery = `
        INSERT INTO forecast_data 
        (location, lat, lon, date, time, temperature, weather_id, pressure, humidity, clouds, wind_speed, wind_gust, pop, rain_3h)
        VALUES ?
      `;

      const values = weatherData.map(item => [
        item.location,
        item.lat,
        item.lon,
        item.date,
        item.time,
        item.temperature,
        item.weather_id,
        item.pressure,
        item.humidity,
        item.clouds,
        item.wind_speed,
        item.wind_gust || null,
        item.pop || null,
        item.rain_3h || null,
      ]);

      const [result] = await connection.query(insertQuery, [values]);
      console.log('Insert result:', result);  // Log the result of the insertion
    } catch (error) {
      console.error('Error handling weather data:', error);
    } finally {
      if (connection) {
        connection.release(); // Release the connection back to the pool
      }
    }
  }
}

export default WeatherData;
