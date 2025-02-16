// pages/index.js

import React from 'react';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.textContainer}>
        <p style={styles.text}>nangangahibi na ako hahah di mo na ako inlalambing</p>
      </div>
      <div style={styles.emoji}>😢</div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#fce4ec',
    fontFamily: 'Arial, sans-serif',
  },
  textContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  text: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#8e24aa',
    marginBottom: '10px',
  },
  emoji: {
    fontSize: '50px',
  }
};

export default HomePage;
