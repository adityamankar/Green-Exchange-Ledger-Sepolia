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

    const buttonLabel = data.currentlyListed ? "Already on Marketplace" : "List on Marketplace";
    console.log("button state : ", buttonLabel);
    const IPFSUrl = GetIpfsUrlFromPinata(data.image);

    const handleListClick = () => {
        if (!data.currentlyListed) {
            onList(data.tokenId);
        }
    };

    return (
        <div className="nft-tile" style={{  marginLeft: '12px', marginTop: '5px', marginBottom: '12px' }}>
            <Link to={newTo}>
                <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
                    <img src={IPFSUrl} alt="" className="w-72 h-80 rounded-lg object-cover" crossOrigin="anonymous" />
                    <div className= "text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                        <strong className="text-xl">{data.name}</strong>
                        <p className="display-inline">
                            {data.description}
                        </p>
                    </div>
                </div>
            </Link>
            {showListButton && (
                <button onClick={handleListClick} className="list-button" style={listButtonStyle} disabled={data.currentlyListed}>
                        {buttonLabel}
                </button>
            )}
        </div>
    );
}

export default NFTTile;

const listButtonStyle = {
    backgroundColor: '#007bff', // A shade of blue
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: 'calc(100% - 24px)', // Adjust button width to fit the tile width
    marginTop: '10px', // Space between the image and the button
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' // Shadow for depth
};