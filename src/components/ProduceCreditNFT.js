import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";

export default function ProduceCreditNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '0.01'});
    const [fileURL, setFileURL] = useState(null);
    const [selectedOption, setSelectedOption] = useState("mintOnly"); // New state to track selected option
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();

    async function disableButton() {
        
        // I have added 2 section "mint only" and "mint and list" instead of 2 buttons. Now we have only one button
        // const listButton = document.getElementById("list-button")
        // listButton.disabled = true
        // listButton.style.backgroundColor = "grey";
        // listButton.style.opacity = 0.3;

        const mintButton = document.getElementById("mint-button")
        mintButton.disabled = true
        mintButton.style.backgroundColor = "grey";
        mintButton.style.opacity = 0.3;
    }

    async function enableButton() {

        // I have added 2 section "mint only" and "mint and list" instead of 2 buttons. Now we have only one button
        // const listButton = document.getElementById("list-button")
        // listButton.disabled = false
        // listButton.style.backgroundColor = "#A500FF";
        // listButton.style.opacity = 1;

        const mintButton = document.getElementById("mint-button")
        mintButton.disabled = false
        mintButton.style.backgroundColor = "#A500FF";
        mintButton.style.opacity = 1;
    }

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        //check for file extension
        try {
            //upload the file to IPFS
            disableButton();
            updateMessage("Uploading image.. please dont click anything!")
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                enableButton();
                updateMessage("")
                setFileURL(response.pinataURL);
            }
        }
        catch(e) {
            alert("Error during file upload", e);
        }
    }

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !description || !price || !fileURL)
        {
            updateMessage("IPFS Please fill all the fields!")
            return -1;
        }

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);

            if(response.success === true){
                return response.pinataURL;
            }
        }
        catch(e) {
            alert("error uploading JSON metadata:", e)
        }
    }
    
    async function mintNFT(e, shouldList) {
        e.preventDefault();
        
        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            
            if(metadataURL === -1)
                return;
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            updateMessage("Uploading NFT(takes 5 mins).. please don't click anything!")

            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

            //massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            //actually create the NFT
            let transaction = await contract.createToken(metadataURL, price, shouldList, { value: listingPrice });
        
            await transaction.wait()

            alert("Successfully minted your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: ''});
            window.location.replace("/profile")
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

    return (
        <div className="">
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
            <h3 className="text-center font-bold text-purple-500 mb-8">Produce New Credit</h3>
                <div className="flex justify-center mb-4">
                    <button 
                        type="button"
                        className={`font-bold py-2 px-4 rounded-l ${selectedOption === "mintOnly" ? "bg-purple-500 text-white" : "bg-white text-purple-500"}`}
                        onClick={() => {
                            setSelectedOption("mintOnly");
                            updateFormParams({ ...formParams, price: '0.01' }); // Set price to '0.01' when "Mint Only" is selected
                        }}
                    >
                        Mint Only
                    </button>
                    <button 
                        type="button"
                        className={`font-bold py-2 px-4 rounded-r ${ selectedOption === "mintAndList" ? "bg-purple-500 text-white" : "bg-white text-purple-500"}`}
                        onClick={() => setSelectedOption("mintAndList")}
                    >
                        Mint and Sell
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="CC#426" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Carbon Credit Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                {selectedOption === "mintAndList" && (
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                    </div>
                )}
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                    <input type={"file"} onChange={OnChangeFile}></input>
                </div>
                <br></br>
                <div className="text-red-500 text-center">{message}</div>
                
                <button onClick={(e) => mintNFT(e, selectedOption === "mintAndList")} className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg" id="mint-button">
                    {selectedOption === "mintAndList" ? "Mint and List on Marketplace" : "Mint NFT"}
                </button>
            </form>
        </div>
        </div>
    )   
}