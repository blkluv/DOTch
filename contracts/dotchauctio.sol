// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract DutchRushAuction {
    struct Auction {
        uint256 id;
        string name;
        string description;
        address tokenAddress;
        address owner;
        uint256 startTime;
        uint256 duration;
        uint256 startPrice;
        uint256 minPrice;
        uint256 totalTokens;
        uint256 tokensSold;
        bool isActive;
    }

    struct AuctionDetails {
        string name;
        string description;
        address tokenAddress;
        address owner;
        uint256 startTime;
        uint256 duration;
        uint256 endTime;
        uint256 startPrice;
        uint256 minPrice;
        uint256 currentPrice;
        uint256 timeRemaining;
        uint256 tokensSold;
        uint256 totalTokens;
        bool isActive;
        string status;
    }

    uint256 public nextAuctionId;
    mapping(uint256 => Auction) public auctions;
    mapping(address => mapping(uint256 => uint256)) public userPurchases;

    event AuctionCreated(uint256 indexed auctionId, string name, address indexed owner);
    event TokensPurchased(uint256 indexed auctionId, address indexed buyer, uint256 amount, uint256 price);
    event AuctionEnded(uint256 indexed auctionId);

    /// Create a new auction
    function createAuction(
        string calldata name,
        string calldata description,
        address tokenAddress,
        uint256 startTime,
        uint256 duration,
        uint256 startPrice,
        uint256 minPrice,
        uint256 totalTokens
    ) external {
        require(startPrice > minPrice, "Start price must be > min price");
        require(duration > 0, "Duration must be > 0");

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), totalTokens);

        auctions[nextAuctionId] = Auction({
            id: nextAuctionId,
            name: name,
            description: description,
            tokenAddress: tokenAddress,
            owner: msg.sender,
            startTime: startTime,
            duration: duration,
            startPrice: startPrice,
            minPrice: minPrice,
            totalTokens: totalTokens,
            tokensSold: 0,
            isActive: true
        });

        emit AuctionCreated(nextAuctionId, name, msg.sender);
        nextAuctionId++;
    }

    /// Get current price based on elapsed time
    function getCurrentPrice(uint256 auctionId) public view returns (uint256) {
        Auction memory a = auctions[auctionId];
        if (block.timestamp <= a.startTime) return a.startPrice;
        if (block.timestamp >= a.startTime + a.duration) return a.minPrice;

        uint256 elapsed = block.timestamp - a.startTime;
        uint256 priceDrop = ((a.startPrice - a.minPrice) * elapsed) / a.duration;
        return a.startPrice - priceDrop;
    }
function buyTokens(uint256 auctionId, uint256 tokenAmount) external payable {
    Auction storage a = auctions[auctionId];
    require(a.isActive, "Auction inactive");
    require(block.timestamp >= a.startTime, "Auction not started");
    require(block.timestamp < a.startTime + a.duration, "Auction ended");
    require(tokenAmount > 0, "Must buy at least 1 token");
    require(a.tokensSold + tokenAmount <= a.totalTokens, "Not enough tokens left");

    uint256 currentPrice = getCurrentPrice(auctionId);
    uint256 totalCost = currentPrice * tokenAmount;
    require(msg.value >= totalCost, "Not enough ETH sent");

    a.tokensSold += tokenAmount;
    userPurchases[msg.sender][auctionId] += tokenAmount;

    IERC20(a.tokenAddress).transfer(msg.sender, tokenAmount);

    // ✅ Refund excess ETH using call instead of transfer
    if (msg.value > totalCost) {
        uint256 refund = msg.value - totalCost;
        (bool success, ) = payable(msg.sender).call{value: refund}("");
        require(success, "Refund failed");
    }

    emit TokensPurchased(auctionId, msg.sender, tokenAmount, currentPrice);

    if (a.tokensSold == a.totalTokens) {
        a.isActive = false;
        emit AuctionEnded(auctionId);
    }
}


    /// Manually end auction (after it's expired)
    function endAuction(uint256 auctionId) external {
        Auction storage a = auctions[auctionId];
        require(a.isActive, "Auction already ended");
        require(block.timestamp >= a.startTime + a.duration, "Auction not finished");
        require(msg.sender == a.owner, "Only owner can end");

        a.isActive = false;
        emit AuctionEnded(auctionId);
    }

    /// View auction details using AuctionDetails struct
    function getAuctionDetails(uint256 auctionId) external view returns (AuctionDetails memory) {
        Auction memory a = auctions[auctionId];
        uint256 end = a.startTime + a.duration;
        uint256 remaining = block.timestamp >= end ? 0 : (end - block.timestamp);
        uint256 price = getCurrentPrice(auctionId);

        string memory auctionStatus;
        if (!a.isActive || block.timestamp >= end) {
            auctionStatus = "Ended";
        } else if (block.timestamp < a.startTime) {
            auctionStatus = "NotStarted";
        } else {
            auctionStatus = "Active";
        }

        return AuctionDetails({
            name: a.name,
            description: a.description,
            tokenAddress: a.tokenAddress,
            owner: a.owner,
            startTime: a.startTime,
            duration: a.duration,
            endTime: end,
            startPrice: a.startPrice,
            minPrice: a.minPrice,
            currentPrice: price,
            timeRemaining: remaining,
            tokensSold: a.tokensSold,
            totalTokens: a.totalTokens,
            isActive: a.isActive,
            status: auctionStatus
        });
    }
}