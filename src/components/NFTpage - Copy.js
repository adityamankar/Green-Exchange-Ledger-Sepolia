import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

//should be same in NFTTile
const validNFTState = ["Listed", "NotListed", "NotOwner"];
const validOperations = ["Buy", "Withdraw", "Update", "Sell"];

export default function NFTPage({ props }) {
    const [formParams, updateFormParams] = useState({ formPrice: "" });
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");
    const [selectedOption, setSelectedOption] = useState("default");

    const params = useParams();
    const tokenId = params.tokenId;
    const currentOperationState = params.currentOperationState;
    console.log(params);

    if (!dataFetched) getNFTData(tokenId);
    if (typeof data.image == "string") {
        data.image = GetIpfsUrlFromPinata(data.image);
    }

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        //Pull the deployed contract instance
        let contract = new ethers.Contract(
            MarketplaceJSON.address,
            MarketplaceJSON.abi,
            signer
        );
        //create an NFT Token
        var tokenURI = await contract.tokenURI(tokenId);
        const listedToken = await contract.getListedTokenForId(tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let item = {
            price: meta.price,
            tokenId: tokenId,
            seller: listedToken.seller,
            owner: listedToken.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            listedOnMarketplace: listedToken.currentlyListed,
        };

        updateData(item);
        updateDataFetched(true);
        updateCurrAddress(addr);
    }

    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            //Pull the deployed contract instance
            let contract = new ethers.Contract(
                MarketplaceJSON.address,
                MarketplaceJSON.abi,
                signer
            );
            const salePrice = ethers.utils.parseUnits(data.price, "ether");
            updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
            //run the executeSale function
            let transaction = await contract.executeSale(tokenId, {
                value: salePrice,
            });
            await transaction.wait();

            alert("You successfully bought the NFT!");
            updateMessage("");
        } catch (e) {
            alert("Upload Error" + e);
        }
    }

    async function listNFT(tokenId) {
        try {
            const { formPrice } = formParams;
            if (!formPrice) {
                updateMessage("Please fill all the fields!");
                return -1;
            }
            const ethers = require("ethers");
            // Logic to interact with the smart contract
            // You need ethers.js setup similar to getNFTData
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                MarketplaceJSON.address,
                MarketplaceJSON.abi,
                signer
            );

            // Call the smart contract function
            // await contract.updateSellingPrice(
            //     tokenId,
            //     ethers.utils.parseUnits(price.toString(), "ether"),
            // );

            const listingPrice = await contract.getListPrice();
            // Call the smart contract function
            await contract.listTokenOnMarketplace(
                tokenId,
                ethers.utils.parseUnits(formPrice.toString(), "ether"),
                { value: listingPrice }
            );

            updateFormParams({ formPrice: "" });

            window.location.replace("/");
        } catch (e) {
            alert("Error: " + e);
        }
    }

    async function delistNFT(tokenId) {
        try {
            const ethers = require("ethers");
            // After adding your Hardhat network to your Metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Pull the deployed contract instance
            let contract = new ethers.Contract(
                MarketplaceJSON.address,
                MarketplaceJSON.abi,
                signer
            );

            updateMessage("Delisting the NFT... Please Wait (Upto 5 mins)");

            // Run the delistTokenFromMarketplace function
            // const salePrice = ethers.utils.parseUnits(data.price, 'ether');
            const transaction = await contract.delistTokenFromMarketplace(
                tokenId,
                ethers.utils.parseUnits(data.price.toString(), "ether")
            );
            await transaction.wait();

            alert("You successfully delisted the NFT!");
            updateMessage("");
            window.location.replace("/");
        } catch (e) {
            alert("Error: " + e);
        }
    }

    return (
        <div>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div className="flex justify-center mb-4">
                        {currentOperationState == "Buy" ? (
                            <div>Buy this NFT</div>
                        ) : currentOperationState == "Withdraw" ? (
                            <div>Remove Credit from Marketplace</div>
                        ) : currentOperationState == "Update" ? (
                            <div>Update Selling Price</div>
                        ) : currentOperationState == "Sell" ? (
                            <><button type="button" className={`font-bold py-2 px-4 rounded-l ${selectedOption === "default" ? "bg-purple-500 text-white" : "bg-white text-purple-500"}`}
                                onClick={() => setSelectedOption("default")}>
                                Sell
                            </button>
                            <button type="button" className={`font-bold py-2 px-4 rounded-r ${ selectedOption === "update" ? "bg-purple-500 text-white" : "bg-white text-purple-500" }`}
                                onClick={() => setSelectedOption("update")} >
                                Update Price
                            </button></>
                        ) : (
                            alert("Operation not supported")
                        )}
                    </div>
                    <div>Token ID: {tokenId}</div>
                    <div>Name: {data.name}</div>
                    <div>Description: {data.description}</div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        {currentOperationState == "Buy" ? (
                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                onClick={() => buyNFT(tokenId)} >
                                Buy this NFT
                            </button>
                        ) : currentOperationState == "Withdraw" ? (
                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                onClick={() => delistNFT(tokenId)} >
                                Withdraw
                            </button>
                        ) : currentOperationState == "Update" ? (
                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                onClick={() => delistNFT(tokenId)}>
                                Withdraw
                            </button>
                        ) : currentOperationState == "Sell" ? (
                            <>
                                {selectedOption == "update" && (
                                    <div className="mb-6">
                                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">
                                            Price (in ETH)
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price}
                                            onChange={(e) =>
                                                updateFormParams({
                                                    ...formParams,
                                                    price: e.target.value,
                                                })
                                            }
                                        ></input>
                                    </div>
                                )}
                                <button
                                    className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                    onClick={() => listNFT(tokenId)}>
                                    List it on Marketplace
                                </button>
                            </>
                        ) : (
                            alert("Operation not supported")
                        )}
                        <div className="text-green text-center mt-3">
                            {message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
