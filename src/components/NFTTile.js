import axie from "../tile.jpeg";
import {
    BrowserRouter as Router,
    Link,
} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";
import { useState, useEffect } from "react";

const validSourcePages = ["Profile", "Marketplace", "SellNFT"];
const validNFTState = ["Listed", "NotListed", "NotOwner"];
const validOperations = ["Details", "Buy", "Withdraw", "Update", "Sell"];

function NFTTile ({data, sourcePage}) {
    const [currentNFTState, setCurrentNFTState] = useState("");
    const [currentOperationState, setCurrentOperationState] = useState("");
    const navigate = useNavigate();

    // const newTo = `/nftPage/${data.tokenId}/${currentNFTState}`;

    useEffect(() => {
        if (sourcePage === "Profile") {
            setCurrentNFTState(data.listedOnMarketplace ? "Listed" : "NotListed");
        } else if (sourcePage === "Marketplace") {
            setCurrentNFTState(data.iAmOwner ? "Listed" : "NotOwner");
        } else if (sourcePage === "SellNFT") {
            setCurrentNFTState("NotListed");
        }
    }, [data, sourcePage]); // Add data and sourcePage as dependencies

    const handleOperationChange = (tokenId, operation) => {
        setCurrentOperationState(operation);
        navigate(`/nftPage/${tokenId}/${operation}`);
    };

    const IPFSUrl = GetIpfsUrlFromPinata(data.image);

    return (
        <div className="nft-tile" style={{ marginLeft: "12px", marginTop: "5px", marginBottom: "12px",}}>
            <div className="ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl" style={{ boxShadow: "0 4px 8px rgba(10,10,10,0.8)" }} >
                <div onClick={() => handleOperationChange(data.tokenId, "Details")}>
                    <img src={IPFSUrl} alt="" className="w-72 h-80 border-2 rounded-lg object-cover" crossOrigin="anonymous" />
                </div>
                <div className="text-white w-full p-2 rounded-lg" style={{ backgroundColor: "rgba(100, 100, 100, 0.5)", }}>
                    <strong className="text-xl">Token: {data.tokenId}</strong>
                    <br />
                    <strong className="text-xl">{data.name}</strong>
                    <br /> <br />
                    <strong className="text-xl">PRICE: {data.price} ( ETH )</strong>
                </div>

                {/* <Link to={`/nftPage/${data.tokenId}/${currentOperationState}`} className="w-full"> */}
                    <div className="w-full" style={{ overflow: "hidden" }}>
                        {currentNFTState == "NotListed" && (
                            <button className="text-xl" style={NFTButtonStyle} onClick={() => handleOperationChange(data.tokenId, "Sell")}>
                                Sell
                            </button>
                        )}
                        {currentNFTState == "Listed" && (
                            <div style={{ display: 'flex' }}>
                                <button className="text-xl" style={NFTButtonStyle} onClick={() => handleOperationChange(data.tokenId, "Withdraw")}>
                                    Withdraw
                                </button>
                                <div style={{ marginLeft: '1px', marginRight: '1px' }}></div>
                                <button className="text-xl" style={NFTButtonStyle} onClick={() => handleOperationChange(data.tokenId, "Update")}>
                                    Update
                                </button>
                            </div>
                        )}
                        {currentNFTState == "NotOwner" && (
                            <button className="text-xl" style={NFTButtonStyle} onClick={() => handleOperationChange(data.tokenId, "Buy")}>
                                Buy
                            </button>
                        )}
                    </div>
                {/* </Link> */}
            </div>
        </div>
    );
}

export default NFTTile;

const NFTButtonStyle = {
    backgroundColor: "rgba(0, 123, 255, 0.65)", // A shade of blue
    color: "white",
    padding: "20px 20px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "5px",
    cursor: "pointer",
    width: "calc(100%)", // Adjust button width to fit the tile width
    marginTop: "10px", // Space between the image and the button
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Shadow for depth
};