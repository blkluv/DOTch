const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Web3 } = require('web3');
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
const RPC_URL = process.env.POLKADOT_RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x258ED2965B955cdAFf151F1c38a181Ec85623942';

// Create a web3 instance with your RPC URL
const web3 = new Web3(RPC_URL);

// Helper function to call a contract method
async function callContractMethod(methodName, args) {
  try {
    console.log(`Calling contract method: ${methodName} with args:`, args);
    
    // Define function signatures
    const signatures = {
      'getAllAuctions': 'getAllAuctions()',
      'getAuction': 'getAuction(uint256)',
      'getAuctionDetails': 'getAuctionDetails(uint256)'
    };
    
    if (!signatures[methodName]) {
      throw new Error(`Unknown method: ${methodName}`);
    }
    
    // Get the function signature
    const signature = signatures[methodName];
    
    // Calculate the function selector (first 4 bytes of keccak256 hash)
    const selector = web3.utils.keccak256(signature).slice(0, 10);
    
    // Encode parameters if needed
    let data = selector;
    if (args.length > 0 && (methodName === 'getAuction' || methodName === 'getAuctionDetails')) {
      // Encode uint256 parameter (ID)
      const encodedParams = web3.eth.abi.encodeParameters(['uint256'], [args[0]]).slice(2);
      data = selector + encodedParams;
    }
    
    // Call the contract using eth_call
    const result = await web3.eth.call({
      to: CONTRACT_ADDRESS,
      data: data
    });
    
    console.log(`Contract method ${methodName} result:`, result);
    return result;
  } catch (error) {
    console.error(`Error calling contract method ${methodName}:`, error);
    throw error;
  }
}

// Helper function to decode contract results for Solidity contracts
function decodeContractResult(result, methodName) {
  if (!result || result === '0x') return null;
  
  try {
    console.log('Raw result from contract:', result);
    
    // For getAuctionDetails, let's try a completely different approach
    if (methodName === 'getAuctionDetails') {
      // Let's manually parse the data
      // First, remove the 0x prefix
      const hexData = result.slice(2);
      
      // Create a structured object from the hex data
      // Each field is 32 bytes (64 hex characters)
      const fields = [];
      for (let i = 0; i < hexData.length; i += 64) {
        fields.push('0x' + hexData.slice(i, i + 64));
      }
      
      console.log('Parsed fields:', fields);
      
      // Now let's try to interpret each field
      const parsedData = {
        // The first few fields appear to be offsets for dynamic data
        offsets: {
          first: web3.utils.hexToNumberString(fields[0]),
          second: web3.utils.hexToNumberString(fields[1]),
          third: web3.utils.hexToNumberString(fields[2])
        },
        // These appear to be addresses
        owner: web3.utils.toChecksumAddress('0x' + fields[3].slice(26)),
        tokenAddress: web3.utils.toChecksumAddress('0x' + fields[4].slice(26)),
        // These appear to be timestamps or durations
        startTime: web3.utils.hexToNumber(fields[5]),
        duration: web3.utils.hexToNumber(fields[6]),
        endTime: web3.utils.hexToNumber(fields[7]),
        // This appears to be a price
        startPrice: web3.utils.hexToNumber(fields[8]),
        minPrice: web3.utils.hexToNumber(fields[9]),
        currentPrice: web3.utils.hexToNumber(fields[10]),
        // These appear to be counters or other numeric values - swapping the field assignments
        tokensSold: web3.utils.hexToNumber(fields[11]),
        totalTokens: web3.utils.hexToNumber(fields[12]),
        isActive: Boolean(web3.utils.hexToNumber(fields[13])),
        timeRemaining: web3.utils.hexToNumber(fields[14])
      };
      
      // Improved string decoding
      try {
        // For each string, we need to:
        // 1. Find its offset in the data
        // 2. At that offset, read the length of the string
        // 3. Read that many bytes after the length field
        
        // Find the offsets (convert from hex to decimal)
        const nameOffset = web3.utils.hexToNumber(fields[0]);
        const descOffset = web3.utils.hexToNumber(fields[1]);
        const statusOffset = web3.utils.hexToNumber(fields[2]);
        
        // Calculate byte positions (each byte is 2 hex chars)
        const namePos = nameOffset * 2;
        const descPos = descOffset * 2;
        const statusPos = statusOffset * 2;
        
        // Read string lengths (first 32 bytes/64 hex chars at each position)
        const nameLength = web3.utils.hexToNumber('0x' + hexData.slice(namePos, namePos + 64));
        const descLength = web3.utils.hexToNumber('0x' + hexData.slice(descPos, descPos + 64));
        const statusLength = web3.utils.hexToNumber('0x' + hexData.slice(statusPos, statusPos + 64));
        
        console.log('String lengths:', { nameLength, descLength, statusLength });
        
        // Read the actual string data (skip the length field)
        const nameData = hexData.slice(namePos + 64, namePos + 64 + (nameLength * 2));
        const descData = hexData.slice(descPos + 64, descPos + 64 + (descLength * 2));
        const statusData = hexData.slice(statusPos + 64, statusPos + 64 + (statusLength * 2));
        
        // Convert hex to ASCII
        parsedData.name = web3.utils.hexToString('0x' + nameData);
        parsedData.description = web3.utils.hexToString('0x' + descData);
        parsedData.status = web3.utils.hexToString('0x' + statusData);
        
        // Clean up any null characters
        parsedData.name = parsedData.name.replace(/\0/g, '');
        parsedData.description = parsedData.description.replace(/\0/g, '');
        parsedData.status = parsedData.status.replace(/\0/g, '');
      } catch (stringError) {
        console.error('Error decoding strings:', stringError);
        
        // Fallback: look for string data at the end of the result
        // This is a more direct approach that looks for ASCII text
        const stringData = hexData.slice(15 * 64); // Skip the first 15 fields
        
        // Try to extract readable strings
        let currentString = '';
        let strings = [];
        
        for (let i = 0; i < stringData.length; i += 2) {
          const charCode = parseInt(stringData.slice(i, i + 2), 16);
          if (charCode >= 32 && charCode <= 126) { // Printable ASCII
            currentString += String.fromCharCode(charCode);
          } else if (currentString.length > 0) {
            strings.push(currentString);
            currentString = '';
          }
        }
        
        if (currentString.length > 0) {
          strings.push(currentString);
        }
        
        // Filter out empty strings and assign them
        strings = strings.filter(s => s.trim().length > 0);
        
        if (strings.length >= 1) parsedData.name = strings[0];
        if (strings.length >= 2) parsedData.description = strings[1];
        if (strings.length >= 3) parsedData.status = strings[2];
      }
      
      return parsedData;
    }
    
    // For other methods
    const returnTypes = {
      'getAllAuctions': 'tuple[]', // Adjust based on your actual return type
      'getAuction': 'tuple'        // Adjust based on your actual return type
    };
    
    return web3.eth.abi.decodeParameter(returnTypes[methodName], result);
  } catch (error) {
    console.error('Error decoding contract result:', error);
    // Log more details about the result for debugging
    console.error('Raw result:', result);
    
    // Return the raw result if decoding fails
    return { rawResult: result };
  }
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

// Add a new endpoint to get auction details with ID=0
app.get('/api/auction-details', async (req, res) => {
  try {
    console.log('Fetching auction details with ID: 0');
    
    // Add a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 15000)
    );
    
    // Call getAuctionDetails with ID=0
    const queryPromise = callContractMethod('getAuctionDetails', [0]);
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    if (!result || result === '0x') {
      return res.status(404).json({
        success: false,
        error: 'No auction details found'
      });
    }
    
    // Decode the result
    const decodedResult = decodeContractResult(result, 'getAuctionDetails');
    
    console.log('Retrieved auction details:', decodedResult);
    return res.json({ 
      success: true, 
      data: decodedResult
    });
  } catch (error) {
    console.error('Error fetching auction details:', error);
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
    rpcUrl: RPC_URL,
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
  console.log(`- GET /api/auction-details - Returns auction details (ID=0)`);
  console.log(`- GET /health - Health check endpoint`);
  console.log(`CORS enabled - API accessible from any origin`);
  console.log(`Using RPC URL: ${RPC_URL}`);
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
}); 
