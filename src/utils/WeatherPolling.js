import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const PollingContext = createContext();

export const usePolling = () => {
  return useContext(PollingContext);
};

export const PollingProvider = ({ children }) => {
  const [fetchData, setFetchData] = useState({
    count: 0,
    firstFetchTime: null,
  });

  // Function to show error toast
  const showFetchLimitToast = () => {
    toast.error('This is the most up-to-date data. Please try again later.', {
      duration: 4000,
      style: {
        borderRadius: "30px",
        fontSize: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  // Load persisted data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFetchData = localStorage.getItem('weatherFetchData');
      
      if (savedFetchData) {
        try {
          const parsedData = JSON.parse(savedFetchData);
          
          const now = Date.now();
          if (parsedData.firstFetchTime && now - parsedData.firstFetchTime <= 60000) {
            setFetchData(parsedData);
          } else {
            setFetchData({ count: 0, firstFetchTime: null });
            localStorage.removeItem('weatherFetchData');
          }
        } catch (error) {
          console.error('Error parsing fetch data:', error);
        }
      }
    }
  }, []);

  // Memoized fetch weather data function
  const fetchWeatherData = useCallback(async () => {
    const now = Date.now();
  
    setFetchData(prev => {
      let newCount = prev.count;
      let newFirstFetchTime = prev.firstFetchTime;
  
      if (!newFirstFetchTime) {
        newFirstFetchTime = now;
      }
  
      if (now - newFirstFetchTime > 60000) {
        newCount = 0;
        newFirstFetchTime = now;
      }
  
      if (newCount < 5) {
        newCount++;
  
        fetch('http://localhost:3000/api/fetchWeatherData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch weather data');
            }
            return response.json();
          })
          .then(data => {
            console.log('Weather data fetched successfully');
          })
          .catch(error => {
            console.error('Error fetching weather data:', error);
            toast.error('An error occurred while fetching weather data.', {
              duration: 4000,
              style: {
                borderRadius: '30px',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
            });
          });
      } else {
        console.log('Fetch limit reached. No more fetches allowed within 1 minute.');
        showFetchLimitToast();
      }
  
      // Update localStorage with new fetch data
      if (typeof window !== 'undefined') {
        localStorage.setItem('weatherFetchData', JSON.stringify({
          count: newCount,
          firstFetchTime: newFirstFetchTime,
        }));
      }
  
      return {
        count: newCount,
        firstFetchTime: newFirstFetchTime,
      };
    });
  }, []); // Empty dependency array since it doesn't depend on any external values

  // Set up polling
  useEffect(() => {
    // Initial fetch
    fetchWeatherData();

    // Set up interval for polling every 5 minutes
    const intervalId = setInterval(fetchWeatherData, 300000); // 5 minutes in milliseconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchWeatherData]); // Add fetchWeatherData as a dependency

  // Provide the fetchWeatherData function to children
  return (
    <PollingContext.Provider value={{ fetchWeatherData }}>
      {children}
    </PollingContext.Provider>
  );
};

export default PollingProvider;