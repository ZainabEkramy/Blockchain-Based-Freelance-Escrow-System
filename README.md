# Blockchain-Based-Freelance-Escrow-System

### The Blockchain-Based Freelance Escrow System is a decentralized platform designed to secure financial transactions between freelancers and clients using smart contract technology. It eliminates the need for a trusted third party by automating the escrow process on the Ethereum blockchain.

## Prerequisites
Before you begin, make sure you have:

1- Node.js	v16+

2- npm	v8+

3- MetaMask (Browser Extension)

## Setup & Installation Guide
### Step 1: Clone the Repository

  ```bash
  https://github.com/ZainabEkramy/Blockchain-Based-Freelance-Escrow-System.git
  cd Blockchain-Based-Freelance-Escrow-System
```

### Step 2: Install Dependencies
For Hardhat (Backend):

```bash
npm install
```

For React (Frontend):

```bash
cd frontend
npm install
cd ..
```

### Step 3: Setup MetaMask

#### Add a local network to MetaMask:

- Network Name: Hardhat Local

- New RPC URL: http://127.0.0.1:8545

- Chain ID: 31337

- Currency Symbol: ETH

### Step 4: Run the Project

#### Terminal => 1 Start Hardhat Node:

```bash
npx hardhat node
```
Import an account from Hardhat in MetaMask: (choose any private key)

For example:

Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

#### Terminal 2 => Deploy the Contract:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the contract address that appears

#### Terminal 3 => Update Contract Address and start frontend:

```bash
@'                                                                       
{                           
   "address": "the_adderss_that_you_take_it_copy"
}
@' | Out-File -FilePath "src\contract.json" -Encoding UTF8 -Force
```

In same terminal 3
```bash
cd frontend
npm run dev
```

## Use the Platform
1- Open your browser at: http://localhost:5173

2- Click Connect Wallet (ensure MetaMask is on Hardhat Local network)

3- And done ```enjoy your experience with the Freelance Escrow System! :)```
