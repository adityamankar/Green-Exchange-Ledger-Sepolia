import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
// import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { useEffect, useState } from "react";
import { Nav, Tab } from "react-bootstrap";

export default function Marketplace() {
    const sampleData = [
        {
            name: "CC#1",
            description: "Carbon Credit",
            website: "",
            image: "https://gateway.pinata.cloud/ipfs/QmZNS8281J4LkHbevPrWG14CQg17VSfa8fWXHGVJhFamd3",
            price: "0.015ETH",
            currentlySelling: "True",
            address: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
        },
    ];
    const [data, updateData] = useState(sampleData);
    const [dataFetched, updateFetched] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [tabKey, setTabKey] = useState("all");

    // Function to fetch transaction history
    async function fetchTransactionHistory() {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
            MarketplaceJSON.address,
            MarketplaceJSON.abi,
            provider
        );

        const soldFilter = contract.filters.NFTSold();
        const mintedFilter = contract.filters.TokenMintSuccess();
        const mintedAndListedFilter =
            contract.filters.TokenMintAndListSuccess();
        const listedFilter = contract.filters.TokenListedSuccess();
        const delistedFilter = contract.filters.TokenDeListedSuccess();

        // Query the contract for each event
        const soldEvents = await contract.queryFilter(soldFilter);
        const mintedEvents = await contract.queryFilter(mintedFilter);
        const mintedAndListedEvents = await contract.queryFilter(
            mintedAndListedFilter
        );
        const listedEvents = await contract.queryFilter(listedFilter);
        const delistedEvents = await contract.queryFilter(delistedFilter);

        // Merge and map the events to your desired structure
        const history = [
            ...soldEvents.map((event) => ({
                type: "SOLD",
                tokenId: event.args.tokenId.toNumber(),
                buyer: event.args.buyer,
                seller: event.args.seller,
                price: ethers.utils.formatEther(event.args.price),
            })),
            ...mintedEvents.map((event) => ({
                type: "MINTED",
                tokenId: event.args.tokenId.toNumber(),
                owner: event.args.owner,
                seller: event.args.seller,
                price: ethers.utils.formatEther(event.args.price),
                currentlyListed: true,
            })),
            ...mintedAndListedEvents.map((event) => ({
                type: "MINTED AND LISTED",
                tokenId: event.args.tokenId.toNumber(),
                owner: event.args.owner,
                seller: event.args.seller,
                price: ethers.utils.formatEther(event.args.price),
                currentlyListed: true,
            })),
            ...listedEvents.map((event) => ({
                type: "LISTED",
                tokenId: event.args.tokenId.toNumber(),
                owner: event.args.owner,
                seller: event.args.seller,
                price: ethers.utils.formatEther(event.args.price),
                currentlyListed: true,
            })),
            ...delistedEvents.map((event) => ({
                type: "DELISTED",
                tokenId: event.args.tokenId.toNumber(),
                owner: event.args.owner,
                seller: event.args.seller,
                price: ethers.utils.formatEther(event.args.price),
                currentlyListed: false,
            })),
        ];
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
        let contract = new ethers.Contract(
            MarketplaceJSON.address,
            MarketplaceJSON.abi,
            signer
        );
        //create an NFT Token
        let transaction = await contract.getAllNFTs();

        //Fetch all the details of every NFT from the contract and display
        const items = await Promise.all(
            transaction.map(async (i) => {
                var tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;

                let price = ethers.utils.formatUnits(
                    i.price.toString(),
                    "ether"
                );
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                };
                return item;
            })
        );

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
        let contract = new ethers.Contract(
            MarketplaceJSON.address,
            MarketplaceJSON.abi,
            signer
        );
        //create an NFT Token
        let transaction = await contract.getAllNFTs();
        //Fetch all the details of every NFT from the contract and display
        const items = await Promise.all(
            transaction.map(async (i) => {
                // Filter out NFTs that are not currently listed for sale
                if (!i.currentlyListed) {
                    return null; // Skip this NFT
                }
                
                var tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;

                let price = ethers.utils.formatUnits(
                    i.price.toString(),
                    "ether"
                );
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                    iAmOwner: walletAddress == i.seller ? true : false,
                };
                return item;
            })
        );

        // Filter out null values (NFTs that were not listed)
        const filteredItems = items.filter((item) => item !== null);

        updateFetched(true);
        updateData(filteredItems);
    }

    if (!dataFetched) getAllListedNFTs();

    function TransactionList({ transactions }) {
        return (
            <div className="transaction-list">
                {transactions.map((tx, index) => (
                    <div key={index} className="transaction-tile">
                        <h4 className="transaction-heading">{tx.type}</h4>
                        <div>Token ID: {tx.tokenId}</div>
                        <div>
                            Buyer:{" "}
                            {tx.buyer
                                ? `${tx.buyer.substring(
                                      0,
                                      6
                                  )}...${tx.buyer.substring(
                                      tx.buyer.length - 4
                                  )}`
                                : "N/A"}
                        </div>
                        <div>
                            Seller:{" "}
                            {tx.seller
                                ? `${tx.seller.substring(
                                      0,
                                      6
                                  )}...${tx.seller.substring(
                                      tx.seller.length - 4
                                  )}`
                                : "N/A"}
                        </div>
                        <div>Price: {tx.price} ETH</div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <Navbar></Navbar>
            <div className="flex flex-col place-items-center mt-20">
                <div className="md:text-xl font-bold text-white">Top NFTs</div>
                <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                    {data.map((value, index) => {
                        return (
                            <NFTTile
                                data={value}
                                key={index}
                                sourcePage='Marketplace'
                            ></NFTTile>
                        );
                    })}
                </div>
            </div>
            <div className="transaction-history">
                <Tab.Container
                    id="transaction-tabs"
                    defaultActiveKey="all"
                    activeKey={tabKey}
                    onSelect={(k) => setTabKey(k)}
                >
                    <Nav variant="pills" className="flex-row">
                        <Nav.Item>
                            <Nav.Link eventKey="all">All</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="minted">Minted</Nav.Link>
                        </Nav.Item>
                        {/* <Nav.Item>
                            <Nav.Link eventKey="mintedAndListed">
                            Minted and Listed
                            </Nav.Link>
                        </Nav.Item> */}
                        <Nav.Item>
                            <Nav.Link eventKey="listed">Listed</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="sold">Sold</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="delisted">Delisted</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <Tab.Content>
                        <Tab.Pane eventKey="all">
                            <TransactionList
                                transactions={transactionHistory}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="sold">
                            <TransactionList
                                transactions={transactionHistory.filter(
                                    (tx) => tx.type === "SOLD"
                                )}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="minted">
                            <TransactionList
                                transactions={transactionHistory.filter(
                                    (tx) => tx.type === "MINTED"
                                )}
                            />
                        </Tab.Pane>
                        {/* <Tab.Pane eventKey="mintedAndListed">
                            <TransactionList
                                transactions={transactionHistory.filter(
                                    (tx) => tx.type === "MINTED AND LISTED"
                                )}
                            />
                        </Tab.Pane> */}
                        <Tab.Pane eventKey="listed">
                            <TransactionList
                                transactions={transactionHistory.filter(
                                    (tx) => tx.type === "LISTED"
                                )}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="delisted">
                            <TransactionList
                                transactions={transactionHistory.filter(
                                    (tx) => tx.type === "DELISTED"
                                )}
                            />
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </div>
        </div>
    );
}
