import { useEffect, useState } from 'react';

const ApiKeyDebug = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [envCheck, setEnvCheck] = useState<string>('');

  useEffect(() => {
    // Check if the environment variable is available
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setApiKey(key || 'NOT FOUND');
    
    // Log all environment variables
    console.log('All environment variables:', import.meta.env);
    
    // Check if the key starts with our expected prefix
    if (key) {
      if (key.startsWith('AIza')) {
        setEnvCheck('API key format looks correct');
      } else {
        setEnvCheck('API key format looks incorrect');
      }
    } else {
      setEnvCheck('API key not found in environment');
    }
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>API Key Debug:</strong></div>
      <div>Key: {apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND'}</div>
      <div>Status: {envCheck}</div>
      <div>Mode: {import.meta.env.MODE}</div>
      <div>Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default ApiKeyDebug;
