const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configuration
const POLKADOT_RPC_URL = process.env.POLKADOT_RPC_URL || 'https://rpc.polkadot.io';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Helper function to make JSON-RPC calls
async function callRpc(method, params = []) {
  try {
    console.log(`Calling RPC method: ${method}`);
    console.log(`Params: ${JSON.stringify(params)}`);
    
    const response = await axios.post(POLKADOT_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: method,
      params: params
    });
    
    if (response.data.error) {
      throw new Error(`RPC Error: ${JSON.stringify(response.data.error)}`);
    }
    
    return response.data.result;
  } catch (error) {
    console.error(`Error calling RPC method ${method}:`, error);
    throw error;
  }
}

// Helper function to call a contract method
async function callContractMethod(methodName, args = []) {
  // For contracts.call method in Substrate
  const params = {
    dest: CONTRACT_ADDRESS,
    value: 0,
    gas: 100000000,
    inputData: encodeCall(methodName, args)
  };
  
  return callRpc('contracts.call', [params]);
}

// Simple function to encode method calls (this is a placeholder - actual encoding depends on your contract)
function encodeCall(methodName, args) {
  // This is a simplified example - in a real implementation, you would need to properly encode
  // the method selector and arguments according to your contract's ABI
  
  // For example, if your method is "getAllAuctions", you might encode it as:
  if (methodName === 'getAllAuctions') {
    return '0x12345678'; // Replace with actual method selector
  }
  
  // If your method is "getAuction" with an ID parameter:
  if (methodName === 'getAuction') {
    const id = args[0];
    return `0x87654321${id.toString(16).padStart(64, '0')}`; // Replace with actual method selector
  }
  
  throw new Error(`Unknown method: ${methodName}`);
}

// Endpoint to get all auctions
app.get('/api/auctions', async (req, res) => {
  try {
    console.log('Fetching all auctions...');
    
    // Add a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 15000)
    );
    
    const queryPromise = callContractMethod('getAllAuctions');
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    // Parse the result - this depends on how your contract returns data
    // This is a simplified example - you'll need to adjust based on your actual contract
    const auctions = parseContractResult(result);
    
    console.log(`Successfully retrieved ${auctions.length} auctions`);
    return res.json({ success: true, data: auctions });
  } catch (error) {
    console.error('Error fetching all auctions:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Endpoint to get auction by ID
app.get('/api/auctions/:id', async (req, res) => {
  try {
    const auctionId = req.params.id;
    console.log(`Fetching auction with ID: ${auctionId}`);
    
    // Add a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 15000)
    );
    
    const queryPromise = callContractMethod('getAuction', [auctionId]);
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    // Parse the result - this depends on how your contract returns data
    const auctionData = parseContractResult(result);
    
    if (!auctionData) {
      console.log(`Auction with ID ${auctionId} not found`);
      return res.status(404).json({
        success: false,
        error: `Auction with ID ${auctionId} not found`
      });
    }
    
    console.log(`Successfully retrieved auction with ID: ${auctionId}`);
    return res.json({ success: true, data: auctionData });
  } catch (error) {
    console.error(`Error fetching auction with ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Helper function to parse contract results (placeholder - implement based on your contract)
function parseContractResult(result) {
  // This is a placeholder function - you'll need to implement this based on how your contract
  // returns data and how it's encoded in the RPC response
  
  // For example, if the result is a hex string representing SCALE-encoded data:
  // return decodeScale(result);
  
  // For this example, we'll just return mock data
  if (!result) return null;
  
  // Mock implementation - replace with actual parsing logic
  if (result.includes('auctions')) {
    return [
      {
        id: 1,
        name: "Example Auction 1",
        description: "This is an example auction",
        token_address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        start_time: 1650000000000,
        duration: 604800000,
        end_time: 1650604800000,
        start_price: "5000000000000000000",
        min_price: "1000000000000000000",
        current_price: "3500000000000000000",
        time_remaining: 345600000,
        tokens_sold: "3000000000000000000",
        tokens_total: "10000000000000000000",
        is_active: true,
        status: "Active"
      },
      // Add more mock auctions as needed
    ];
  } else {
    return {
      id: 1,
      name: "Example Auction 1",
      description: "This is an example auction",
      token_address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      start_time: 1650000000000,
      duration: 604800000,
      end_time: 1650604800000,
      start_price: "5000000000000000000",
      min_price: "1000000000000000000",
      current_price: "3500000000000000000",
      time_remaining: 345600000,
      tokens_sold: "3000000000000000000",
      tokens_total: "10000000000000000000",
      is_active: true,
      status: "Active"
    };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    rpcUrl: POLKADOT_RPC_URL,
    contractAddress: CONTRACT_ADDRESS
  });
});

// Fallback route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- GET /api/auctions - Returns all auctions`);
  console.log(`- GET /api/auctions/:id - Returns auction by ID`);
  console.log(`- GET /health - Health check endpoint`);
  console.log(`CORS enabled - API accessible from any origin`);
  console.log(`Using RPC URL: ${POLKADOT_RPC_URL}`);
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
}); 