

export const GetIpfsUrlFromPinata = (pinataUrl) => {
    var IPFSUrl = pinataUrl.split("/");
    const lastIndex = IPFSUrl.length;
    // working well locally
    //IPFSUrl = "https://ipfs.io/ipfs/" + IPFSUrl[lastIndex - 1];
    
    //fixing for access issue after deploying on Vercel
    IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];
    
    return IPFSUrl;
};