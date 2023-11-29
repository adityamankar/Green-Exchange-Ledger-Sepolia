import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";

export default function SellNFT () {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        let sumPrice = 0;
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();

        const walletAddress = await signer.getAddress();
        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

        //create an NFT Token
        let transaction = await contract.getMyNFTs()

        /*
        * Below function takes the metadata from tokenURI and the data returned by getMyNFTs() contract function
        * and creates an object of information that is to be displayed
        */
        
        const items = await Promise.all(transaction.map(async i => {
            
            // Filter out NFTs that are not currently listed for sale
            if (i.currentlyListed) {
                return null; // Skip this NFT
            }
            
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            console.log("price : ", price);
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
                listedOnMarketplace: i.currentlyListed,
                iAmOwner: (walletAddress == i.seller) ? true : false,
            }
            sumPrice += Number(price);
            return item;
        }))
        
        // Filter out null values (NFTs that were not listed)
        // const filteredItems = items.filter(item => item !== null);
        const filteredItems = items.filter(item => item !== null);
        
        updateData(filteredItems);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    const listNFT = async (tokenId) => {

        const ethers = require("ethers");
        // Logic to interact with the smart contract
        // You need ethers.js setup similar to getNFTData
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const listingPrice = await contract.getListPrice();
        // Call the smart contract function
        await contract.listTokenOnMarketplace(tokenId, ethers.utils.parseUnits("0.1", 'ether'), { value: listingPrice });
        // Refresh the NFT data to reflect changes
        await getNFTData();
        
        window.location.replace("/")
    };

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);

    return (
        <div className="profileClass" style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="profileClass">
            <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                <div className="mb-5">
                    <h2 className="font-bold">Wallet Address</h2>  
                    {address}
                </div>
            </div>
            <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
            </div>
            <div className="flex flex-col text-center items-center mt-11 text-white">
                <h2 className="font-bold">Your NFTs</h2>
                <div className="flex justify-center flex-wrap max-w-screen-xl">
                    {data.map((value, index) => (
                        <NFTTile data={value} key={index} onList={listNFT} showListButton={true} showBuyButton={false}></NFTTile>
                    ))}
                </div>
                <div className="mt-10 text-xl">
                    {data.length == 0 ? "Oops, You do not have NFT that is not listed":""}
                </div>
            </div>
            </div>
        </div>
    )
};