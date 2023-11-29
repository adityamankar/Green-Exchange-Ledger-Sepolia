import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
// import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { useEffect, useState } from 'react';

export default function Marketplace() {
const sampleData = [
    {
        "name": "CC#1",
        "description": "Carbon Credit",
        "website":"",
        "image":"https://gateway.pinata.cloud/ipfs/QmZNS8281J4LkHbevPrWG14CQg17VSfa8fWXHGVJhFamd3",
        "price":"0.015ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
    },
];
const [data, updateData] = useState(sampleData);
const [dataFetched, updateFetched] = useState(false);
const [transactionHistory, setTransactionHistory] = useState([]);

// Function to fetch transaction history
  async function fetchTransactionHistory() {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      provider
    );

    const filter = contract.filters.NFTSold(); // Replace with your event
    const events = await contract.queryFilter(filter);
    
    const history = events.map((event) => {
      const { tokenId, buyer, seller, price } = event.args;
      return {
        tokenId: tokenId.toNumber(),
        buyer,
        seller,
        price: ethers.utils.formatEther(price)
      };
    });
    console.log("history is \n", history );
    setTransactionHistory(history);
  }

  useEffect(() => {
    fetchTransactionHistory();
    // Call other functions like getAllNFTs() here if needed
  }, []);
    
async function getAllNFTs() {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    let transaction = await contract.getAllNFTs()

    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        
        var tokenURI = await contract.tokenURI(i.tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
        }
        return item;
    }))

    updateFetched(true);
    updateData(items);
}

async function getAllListedNFTs() {
    
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const walletAddress = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    let transaction = await contract.getAllNFTs()

    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        
        // Filter out NFTs that are not currently listed for sale
        if (!i.currentlyListed) {
            console.log("not listed : ", i.tokenId.toNumber());
            return null; // Skip this NFT
        }

        var tokenURI = await contract.tokenURI(i.tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            iAmOwner: (walletAddress == i.seller) ? true : false,
        }
        return item;
    }));

    // Filter out null values (NFTs that were not listed)
    const filteredItems = items.filter(item => item !== null);
    
    updateFetched(true);
    updateData(filteredItems);
}

if(!dataFetched)
    getAllListedNFTs();

return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-20">
            <div className="md:text-xl font-bold text-white">
                Top NFTs
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {data.map((value, index) => {
                    return <NFTTile data={value} key={index} showListButton={false} showBuyButton={true}></NFTTile>;
                })}
            </div>
        </div>  
        <div className="transaction-history">
            <h3>Recent Transactions</h3>
            <div className="transaction-list">
                {transactionHistory.map((tx, index) => (
                <div key={index} className="transaction-tile">
                    <div>Token ID: {tx.tokenId}</div>
                    <div>Buyer: {tx.buyer.substring(0, 6)}...{tx.buyer.substring(tx.buyer.length - 4)}</div>
                    <div>Seller: {tx.seller.substring(0, 6)}...{tx.seller.substring(tx.seller.length - 4)}</div>
                    <div>Price: {tx.price} ETH</div>
                </div>
                ))}
            </div>
        </div>
    </div>
);

}