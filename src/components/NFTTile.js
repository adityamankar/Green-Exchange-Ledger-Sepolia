import axie from "../tile.jpeg";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";
  import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile ({data, onList, showListButton = true}) {
    const newTo = {
        pathname:"/nftPage/"+data.tokenId
    }

    const buttonLabel = data.listedOnMarketplace ? "Listed on Marketplace" : "Sell";
    console.log("button state : ", buttonLabel);
    const IPFSUrl = GetIpfsUrlFromPinata(data.image);

    const handleListClick = () => {
        if (!data.listedOnMarketplace) {
            onList(data.tokenId);
        }
    };

    return (
        <div className="nft-tile" style={{  marginLeft: '12px', marginTop: '5px', marginBottom: '12px' }}>
            <div className="ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
                <Link to={newTo}>
                    
                    <img src={IPFSUrl} alt="" className="border-2 w-72 h-80 rounded-lg object-cover" crossOrigin="anonymous" />

                    <div className="text-white w-full p-2 rounded-lg pt-5 -mt-20">
                        <strong className="text-xl">{data.name}</strong>
                        <p className="display-inline">
                            {data.description}
                        </p>
                    </div>
                </Link>
                    <div className="w-72 rounded-lg object-cover" crossOrigin="anonymous" style={{overflow: 'hidden'}}>
                        {showListButton && (
                            <button onClick={handleListClick} className="list-button" style={listButtonStyle} disabled={data.listedOnMarketplace}>
                                    {buttonLabel}
                            </button>
                        )}
                    </div>
            </div>
        </div>
    );
}

export default NFTTile;

const listButtonStyle = {
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