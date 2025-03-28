# DOTch_Auction 

**A Fair and Transparent Dutch Auction Platform for Token Launches on Polkadot**

<p align="center">
  <img src="https://github.com/user-attachments/assets/48e76a8a-c406-410b-ac90-91c53df6bd54" width="500" style="margin: 20px 0;" alt="DOTch Auction Logo"/>
</p>

---

## What is DOTch_Auction?

**DOTch_Auction** is an on-chain, permissionless Dutch auction protocol built for the **Polkadot ecosystem**. It enables Web3 projects to launch their tokens in a **fair, transparent, and decentralized** way — without whales, bots, or private deals.

The protocol is designed to empower communities by giving everyone equal access to token sales and letting the market naturally discover the fair price.

---

## The Problem

Traditional token launches suffer from:
- Gas wars, front-running, and unfair allocation
- Whales dominating public sales and dumping later
- Private VC deals excluding the community
- Lack of transparency and trust in launch mechanics

---

## The Solution: DOTch_Auction

DOTch_Auction introduces an **on-chain Dutch auction model** where:

- Token price starts high and drops over time  
- Users decide when to buy — no rush, no bots  
- Everything is **auditable and programmable**  
- Permissionless, trustless, and community-friendly  
- Built using **Solidity smart contracts **

---

## How It Works

1. A project creates an auction with:
   - Token amount
   - Start price
   - Minimum price
   - Auction duration
2. The token price decreases **linearly over time** according to the formula:

   **`currentPrice = startPrice - ((startPrice - minPrice) * elapsedTime / duration)`**

   This ensures a smooth and predictable price drop, letting the market naturally find a fair price.


3. Buyers participate by purchasing at the price they find fair
4. The auction ends when either:
- All tokens are sold
- The duration ends

---

## UI

![image](https://github.com/user-attachments/assets/daa24b66-651b-4d16-8254-928025d4262a)
![image](https://github.com/user-attachments/assets/046eb91c-6cb3-4346-b193-4529413b0e4e)
![image](https://github.com/user-attachments/assets/180d1084-d7f8-4ffc-9594-04971db79c4a)

---

## Why Dutch Auctions on Polkadot?

- **No gas wars** (thanks to Polkadot's low-fee architecture)  
- **Fair access** for all community members  
- **On-chain price discovery**  
- **Transparency builds trust**  
- **Composable with other Substrate pallets**

---

## Use Cases

- Decentralized token generation events (TGEs)  
- DAO treasury distributions  
- NFT or RWA asset token sales  
- Any launch where fairness matters

---

## Credits

- Nemanja Matic
- Dragan Milosevic
- Todor Todorovic

