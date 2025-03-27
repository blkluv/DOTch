const express = require('express');
const cors = require('cors');
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

// Mock data for auctions
const mockAuctions = [
  {
    id: 1,
    name: "Rare NFT Collection Auction",
    description: "A collection of rare digital art pieces from renowned artists",
    token_address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    start_time: 1650000000000,
    duration: 604800000, // 7 days in milliseconds
    end_time: 1650604800000,
    start_price: "5000000000000000000", // 5 DOT in smallest units
    min_price: "1000000000000000000", // 1 DOT in smallest units
    current_price: "3500000000000000000", // 3.5 DOT in smallest units
    time_remaining: 345600000, // 4 days in milliseconds
    tokens_sold: "3000000000000000000", // 3 tokens
    tokens_total: "10000000000000000000", // 10 tokens
    is_active: true,
    status: "Active"
  },
  {
    id: 2,
    name: "Governance Token Sale",
    description: "Participate in our DAO by acquiring governance tokens",
    token_address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    start_time: 1649500000000,
    duration: 1209600000, // 14 days in milliseconds
    end_time: 1650709600000,
    start_price: "10000000000000000000", // 10 DOT in smallest units
    min_price: "5000000000000000000", // 5 DOT in smallest units
    current_price: "7500000000000000000", // 7.5 DOT in smallest units
    time_remaining: 0, // Ended
    tokens_sold: "8000000000000000000", // 8 tokens
    tokens_total: "10000000000000000000", // 10 tokens
    is_active: false,
    status: "Ended"
  },
  {
    id: 3,
    name: "Future Gaming Platform Token",
    description: "Early access tokens for upcoming blockchain gaming platform",
    token_address: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
    start_time: 1651000000000, // In the future
    duration: 864000000, // 10 days in milliseconds
    end_time: 1651864000000,
    start_price: "2000000000000000000", // 2 DOT in smallest units
    min_price: "500000000000000000", // 0.5 DOT in smallest units
    current_price: "2000000000000000000", // 2 DOT in smallest units (not started yet)
    time_remaining: 864000000, // 10 days in milliseconds
    tokens_sold: "0", // 0 tokens
    tokens_total: "5000000000000000000", // 5 tokens
    is_active: false,
    status: "NotStarted"
  },
  {
    id: 4,
    name: "DeFi Protocol Token Auction",
    description: "Tokens for a new DeFi lending and borrowing protocol",
    token_address: "5DAAnrj7VHTznn2C8LTXDs5dF28XApYuzQzLkNLFr8MhAcaB",
    start_time: 1649800000000,
    duration: 432000000, // 5 days in milliseconds
    end_time: 1650232000000,
    start_price: "3000000000000000000", // 3 DOT in smallest units
    min_price: "1000000000000000000", // 1 DOT in smallest units
    current_price: "2200000000000000000", // 2.2 DOT in smallest units
    time_remaining: 172800000, // 2 days in milliseconds
    tokens_sold: "6000000000000000000", // 6 tokens
    tokens_total: "15000000000000000000", // 15 tokens
    is_active: true,
    status: "Active"
  },
  {
    id: 5,
    name: "Metaverse Land Auction",
    description: "Virtual land parcels in a new blockchain-based metaverse",
    token_address: "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
    start_time: 1649000000000,
    duration: 1209600000, // 14 days in milliseconds
    end_time: 1650209600000,
    start_price: "20000000000000000000", // 20 DOT in smallest units
    min_price: "10000000000000000000", // 10 DOT in smallest units
    current_price: "18500000000000000000", // 18.5 DOT in smallest units
    time_remaining: 0, // Ended
    tokens_sold: "12000000000000000000", // 12 tokens
    tokens_total: "20000000000000000000", // 20 tokens
    is_active: false,
    status: "Ended"
  }
];

// Endpoint to get all auctions
app.get('/api/auctions', (req, res) => {
  // Add a small delay to simulate network latency
  setTimeout(() => {
    res.json({
      success: true,
      data: mockAuctions
    });
  }, 300);
});

// Endpoint to get auction by ID
app.get('/api/auctions/:id', (req, res) => {
  const auctionId = parseInt(req.params.id);
  const auction = mockAuctions.find(a => a.id === auctionId);
  
  // Add a small delay to simulate network latency
  setTimeout(() => {
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: `Auction with ID ${auctionId} not found`
      });
    }
    
    res.json({
      success: true,
      data: auction
    });
  }, 300);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`- GET /api/auctions - Returns all auctions`);
  console.log(`- GET /api/auctions/:id - Returns auction by ID`);
  console.log(`CORS enabled - API accessible from any origin`);
}); 