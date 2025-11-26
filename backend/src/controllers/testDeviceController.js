// =====================================================
// backend/src/controllers/testDeviceController.js
// Simulator controller for testing device data ingestion

const axios = require('axios');
const config = require('../config/env');

class TestDeviceController {
  /**
   * Simulate a single sensor reading
   */
  async simulateReading(req, res, next) {
    try {
      const {
        MAC = 'AA:BB:CC:DD:EE:FF',
        temp,
        hmdt,
        gaz,
        method = 'GET', // Allow testing both GET and POST
      } = req.body;

      // Generate random values if not provided
      const temperature = temp !== undefined ? temp : (Math.random() * 15 + 15).toFixed(2); // 15-30°C
      const humidity = hmdt !== undefined ? hmdt : (Math.random() * 40 + 40).toFixed(2); // 40-80%
      const gas = gaz !== undefined ? gaz : (Math.random() * 500 + 100).toFixed(2); // 100-600 ppm

      // Prepare the data
      const deviceData = {
        MAC,
        temp: temperature,
        hmdt: humidity,
        gaz: gas,
      };

      // Call the actual ingestion endpoint
      let response;
      const baseUrl = `http://localhost:${config.port}`;

      if (method.toUpperCase() === 'POST') {
        response = await axios.post(`${baseUrl}/api/sensor-data/ingest`, deviceData);
      } else {
        response = await axios.get(`${baseUrl}/api/sensor-data/ingest`, {
          params: deviceData,
        });
      }

      res.json({
        success: true,
        message: 'Test reading sent successfully',
        sentData: deviceData,
        serverResponse: response.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Simulate multiple readings over time
   */
  async simulateContinuous(req, res, next) {
    try {
      const {
        MAC = 'AA:BB:CC:DD:EE:FF',
        count = 10,
        interval = 1000, // ms between readings
        method = 'GET',
      } = req.body;

      // Start simulation in background
      res.json({
        success: true,
        message: `Starting simulation of ${count} readings with ${interval}ms interval`,
        MAC,
        method,
      });

      // Run simulation asynchronously
      this._runSimulation(MAC, count, interval, method);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Simulate alert-triggering readings
   */
  async simulateAlert(req, res, next) {
    try {
      const {
        MAC = 'AA:BB:CC:DD:EE:FF',
        alertType = 'temperature', // 'temperature', 'humidity', 'gas', or 'all'
        method = 'GET',
      } = req.body;

      let deviceData = { MAC };

      // Set values that will trigger alerts based on common thresholds
      switch (alertType) {
        case 'temperature':
          deviceData.temp = 35; // High temperature
          deviceData.hmdt = 50;
          deviceData.gaz = 300;
          break;
        case 'humidity':
          deviceData.temp = 22;
          deviceData.hmdt = 85; // High humidity
          deviceData.gaz = 300;
          break;
        case 'gas':
          deviceData.temp = 22;
          deviceData.hmdt = 50;
          deviceData.gaz = 800; // High gas level
          break;
        case 'all':
          deviceData.temp = 36;
          deviceData.hmdt = 88;
          deviceData.gaz = 850;
          break;
        default:
          deviceData.temp = 35;
          deviceData.hmdt = 50;
          deviceData.gaz = 300;
      }

      // Call the actual ingestion endpoint
      const baseUrl = `http://localhost:${config.port}`;
      let response;

      if (method.toUpperCase() === 'POST') {
        response = await axios.post(`${baseUrl}/api/sensor-data/ingest`, deviceData);
      } else {
        response = await axios.get(`${baseUrl}/api/sensor-data/ingest`, {
          params: deviceData,
        });
      }

      res.json({
        success: true,
        message: `Alert simulation sent (${alertType})`,
        sentData: deviceData,
        serverResponse: response.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Simulate multiple devices sending data
   */
  async simulateMultipleDevices(req, res, next) {
    try {
      const { deviceCount = 3, readingsPerDevice = 5, interval = 2000, method = 'GET' } = req.body;

      const devices = [];
      for (let i = 0; i < deviceCount; i++) {
        const mac = `AA:BB:CC:DD:EE:${i.toString(16).padStart(2, '0').toUpperCase()}`;
        devices.push(mac);
      }

      res.json({
        success: true,
        message: `Starting simulation for ${deviceCount} devices`,
        devices,
        readingsPerDevice,
        interval,
      });

      // Run simulations for all devices
      devices.forEach((mac, index) => {
        setTimeout(() => {
          this._runSimulation(mac, readingsPerDevice, interval, method);
        }, index * 500); // Stagger device start times
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Private method to run continuous simulation
   */
  async _runSimulation(MAC, count, interval, method) {
    const baseUrl = `http://localhost:${config.port}`;

    for (let i = 0; i < count; i++) {
      try {
        const deviceData = {
          MAC,
          temp: (Math.random() * 15 + 15).toFixed(2),
          hmdt: (Math.random() * 40 + 40).toFixed(2),
          gaz: (Math.random() * 500 + 100).toFixed(2),
        };

        if (method.toUpperCase() === 'POST') {
          await axios.post(`${baseUrl}/api/sensor-data/ingest`, deviceData);
        } else {
          await axios.get(`${baseUrl}/api/sensor-data/ingest`, {
            params: deviceData,
          });
        }

        console.log(`[Simulator] Sent reading ${i + 1}/${count} for ${MAC}`);

        if (i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error(`[Simulator] Error sending data for ${MAC}:`, error.message);
      }
    }
  }
}

module.exports = new TestDeviceController();
