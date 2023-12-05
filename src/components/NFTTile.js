import axie from "../tile.jpeg";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile ({data, showListButton = false, showBuyButton = false}) {
    const newTo = {
        pathname:"/nftPage/"+data.tokenId
    }

    const buttonLabelInProfileTab = data.listedOnMarketplace ? "Listed on Marketplace" : "Sell";
    const buyButtonLabel = data.iAmOwner ? 'Withdraw' : "Buy";

    const IPFSUrl = GetIpfsUrlFromPinata(data.image);

    return (
        <div className="nft-tile" style={{ marginLeft: '12px', marginTop: '5px', marginBottom: '12px' }}>
            <div className="ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl" style={{ boxShadow: '0 4px 8px rgba(10,10,10,0.8)'}}>
                <Link to={newTo}>
                    <img src={IPFSUrl} alt="" className="border-2 w-72 h-80 rounded-lg object-cover" crossOrigin="anonymous" />
                </Link>
                
                <div className="text-white w-full p-2 rounded-lg" style={{ backgroundColor: 'rgba(100, 100, 100, 0.5)' /* Light grey transparent background */ }}>
                    <strong className="text-xl">Token: {data.tokenId}</strong><br/>
                    <strong className="text-xl">{data.name}</strong>
                    {/* <p className="display-inline">{data.description}</p> */}
                </div>

                <Link to={newTo} className="w-full">
                    <div className="w-full" style={{ overflow: 'hidden' }}>
                        {showBuyButton && (
                            <button className="text-xl" style={NFTButtonStyle}>{buyButtonLabel} <br/>{data.price} ( ETH )</button>
                        )}
                        {showListButton && (
                            <button className="text-xl" style={NFTButtonStyle}>{buttonLabelInProfileTab}</button>
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default NFTTile;

const NFTButtonStyle = {
    backgroundColor: 'rgba(0, 123, 255, 0.65)', // A shade of blue
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: 'calc(100%)', // Adjust button width to fit the tile width
    marginTop: '10px', // Space between the image and the button
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' // Shadow for depth
};