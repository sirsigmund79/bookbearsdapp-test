import { useState, useEffect } from 'react'
import { nftContractAddress } from '../config.js'
import { ethers } from 'ethers'
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal"
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';


// import axios from 'axios'

// import Loader from 'react-loader-spinner'

import NFT from '../utils/NFT.json';
// declare var window: any


const mint = () => {
	// const [mintedNFT, setMintedNFT] = useState(null)
	const [miningStatus, setMiningStatus] = useState("")
	const [loadingState, setLoadingState] = useState(0)
	const [txError, setTxError] = useState("")
	const [currentAccount, setCurrentAccount] = useState('')
	const [correctNetwork, setCorrectNetwork] = useState(false)

	// Checks if wallet is connected
	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window
		if (ethereum) {
			console.log('Got the ethereum obejct: ', ethereum)
		} else {
			console.log('No Wallet found. Connect Wallet')
		}

		// const accounts = await ethereum.request({ method: 'eth_accounts' })

		// if (accounts.length !== 0) {
		// 	console.log('Found authorized Account: ', accounts[0])
		// 	setCurrentAccount(accounts[0])
		// } else {
		// 	console.log('No authorized account found')
		// }
	}

	// Calls Metamask to connect wallet on clicking Connect Wallet button
	const connectWallet = async () => {
		try{
		const providerOptions = {
			injected: {
				display: {
					logo: 'data:image/png;base64,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',
					name: 'Metamask',
					description: 'Connect with the provider in your Browser',
				},
				package: null,
			},
			walletconnect: {
				package: WalletConnectProvider, // required
				options: {
					infuraId: "b62bbe93b8c34ca18a20ac815dcc7552" // required
				}
			},
			coinbasewallet: {
				package: CoinbaseWalletSDK, // Required
				options: {
					appName: "Bookbears", // Required
					infuraId: "b62bbe93b8c34ca18a20ac815dcc7552", // Required
					chainId: 1, // Optional. It defaults to 1 if not provided
					darkMode: false // Optional. Use dark theme, defaults to false
				}
			}
				};
			
		console.log("Connecting through walletConnect!");
		
		const web3Modal = new Web3Modal({
			network: "mainnet", // optional
			cacheProvider: true, // optional
			providerOptions,
			show: true // required
		});
		
		console.log("Web3 modal ", web3Modal);
		
		const instance = await web3Modal.connect();

		const provider = new ethers.providers.Web3Provider(instance);
		// await provider.enable();
		const web3Provider = new providers.Web3Provider(provider);
		const signer = provider.getSigner();
	} catch(error) {console.log(error)}

		const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
		console.log('Found account', accounts[0])
			setCurrentAccount(accounts[0])
	}
	// const connectWallet = async () => {
		
	// 	try {
	// 		const { ethereum } = window

	// 		if (!ethereum) {
	// 			console.log('Metamask not detected')
	// 			return
	// 		}
	// 		let chainId = await ethereum.request({ method: 'eth_chainId' })
	// 		console.log('Connected to chain:' + chainId)

	// 		const rinkebyChainId = '0x1'

	// 		const devChainId = 1
	// 		const localhostChainId = `0x${Number(devChainId).toString(16)}`

	// 		if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
	// 			alert('You are not connected to the Rinkeby Testnet!')
	// 			return
	// 		}

	// 		const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

	// 		console.log('Found account', accounts[0])
	// 		setCurrentAccount(accounts[0])
	// 	} catch (error) {
	// 		console.log('Error connecting to metamask', error)
	// 	}
	// }

	// Checks if wallet is connected to the correct network
	const checkCorrectNetwork = async () => {
		const { ethereum } = window
		let chainId = await ethereum.request({ method: 'eth_chainId' })
		console.log('Connected to chain:' + chainId)

		const rinkebyChainId = '0x1'

		const devChainId = 1
		const localhostChainId = `0x${Number(devChainId).toString(16)}`

		if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
			setCorrectNetwork(false)
		} else {
			setCorrectNetwork(true)
		}
	}

	useEffect(() => {
		checkIfWalletIsConnected()
		checkCorrectNetwork()
	}, []);

  // Create transction to mint NFT when clicking Mint button


	// Creates transaction to mint NFT on clicking Mint Character button
	const mintBookbear = async () => {

    try {
      const {ethereum} = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          nftContractAddress,
          NFT.abi,
          signer
        )

          let overrides = {
                // The maximum units of gas for the transaction to use
            // gasLimit: 28000,

            // The price (in wei) per unit of gas
            // gasPrice: ethers.utils.parseUnits('9.0', 'gwei'),

            // The amount to send with the transaction (i.e. msg.value)
            value: ethers.utils.parseEther('0.15'),
          }

          let nftTx = await nftContract.mint(currentAccount, 1, overrides)
          console.log(overrides.value)
          console.log('mining', nftTx.hash)
          setMiningStatus("In progress")
          // setLoadingState(1);

          let tx = await nftTx.wait()
          // setLoadingState(1)
          console.log('Minted!')

          let event = tx.events[0]
          setMiningStatus("Complete")
          console.log(
            `Mined, see transaction: https://etherscan.io/tx/${nftTx.hash}`
          )
      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch(error) {
      console.log("Catch: ", error)
      // setTxError(error.message)
    }

		// try {
		// 	const { ethereum } = window

		// 	if (ethereum) {
		// 		const provider = new ethers.providers.Web3Provider(ethereum)
		// 		const signer = provider.getSigner()
		// 		const nftContract = new ethers.Contract(
		// 			nftContractAddress,
		// 			NFT.abi,
		// 			signer
		// 		)

    //     let nftTx = await nftContract.mint(currentAccount, 1)
		// 		// let nftTx = await nftContract.mint(currentAccount, 1)
		// 		console.log('Mining....', nftTx.hash)
		// 		setMiningStatus(0)

		// 		let tx = await nftTx.wait()
		// 		setLoadingState(1)
		// 		console.log('Mined!', tx)
		// 		let event = tx.events[0]
		// 		let value = event.args[2]
		// 		// let tokenId = value.toNumber()

		// 		console.log(
		// 			`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTx.hash}`
		// 		)

		// 		// getMintedNFT(tokenId)
		// 	} else {
		// 		console.log("Ethereum object doesn't exist!")
		// 	}
		// } catch (error) {
		// 	console.log('Error minting character', error)
		// 	setTxError(error.message)
		// }
	}

// 	// Gets the minted NFT data
// 	const getMintedNFT = async (tokenId) => {
// 		try {
// 			const { ethereum } = window

// 			if (ethereum) {
// 				const provider = new ethers.providers.Web3Provider(ethereum)
// 				const signer = provider.getSigner()
// 				const nftContract = new ethers.Contract(
// 					nftContractAddress,
// 					NFT.abi,
// 					signer
// 				)

// 				let tokenUri = await nftContract.tokenURI(tokenId)
// 				let data = await axios.get(tokenUri)
// 				let meta = data.data

// 				setMiningStatus(1)
// 				setMintedNFT(meta.image)
// 			} else {
// 				console.log("Ethereum object doesn't exist!")
// 			}
// 		} catch (error) {
// 			console.log(error)
// 			setTxError(error.message)
// 		}
// 	}

	return (
    
		<div className='flex flex-col items-center pt-32 bg-[#FFFFFF] text-[#303030] min-h-screen'>
			<div className='trasition hover:rotate-180 hover:scale-105 transition duration-800 ease-in-out'>
        <img className="object-scale-down h-20 w-15" src="https://ucarecdn.com/1b1d7d42-3c76-48c2-ae93-e8c62b38b588/"></img>
				{/* <svg
					xmlns='http://www.w3.org/2000/svg'
					width='60'
					height='60'
					fill='currentColor'
					viewBox='0 0 16 16'
				>
					<path d='M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z' />
				</svg> */}
			</div>
			<h2 className='text-3xl font-bold mb-20 mt-12'>
				Mint your Bookbear NFT!
			</h2>
			
			{currentAccount === '' ? (
				<button
					className='text-2xl font-bold py-3 px-12 bg-[#4ADDB4] shadow-lg shadow-[#d9d9d9] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
					onClick={connectWallet}
				>
					Connect Wallet
				</button>
			) : correctNetwork ? (
				<button
					className='text-2xl font-bold py-3 px-12 bg-[#4ADDB4] shadow-lg shadow-[#d9d9d9] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
					onClick={mintBookbear}
				>
					Mint
				</button>
				
			) : (
				<div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
					<div>----------------------------------------</div>
					<div>Please connect to the Ethereum Mainnet</div>
					<div>and reload the page</div>
					<div>----------------------------------------</div>
				</div>
			)}
			<p>Cost: 0.15 ETH</p>

			<div className='text-xl font-semibold mb-20 mt-4'>
				<a
					href={`https://opensea.io/collection/bookbeargang`}
					target='_blank'
				>
					<span className='hover:underline hover:underline-offset-8 '>
						View Collection on OpenSea
					</span>
				</a>
			</div>
      <div className='flex flex-col justify-center items-center'>
        {
          txError === "" ? (
            miningStatus === "" ? (
              <div></div>
            ) : miningStatus === "In progress" ? (
              <div><p>Your Bookbear is minting!</p></div>
            ) : (
              <div>
                <p>Success! Your Bookbear has minted. Check OpenSea to see what you got!</p>
                <p><i>Want to mint another?</i></p>
              </div>
            )
            ) : (
              <div>{txError}</div>
            )
        }
        </div>
				
			{/* {loadingState === 0 ? (
				miningStatus === 0 ? (
					txError === null ? (
						<div className='flex flex-col justify-center items-center'>
							<div className='text-lg font-bold'>
								Processing your transaction
							</div>
							<Loader
								className='flex justify-center items-center pt-12'
								type='TailSpin'
								color='red'
								height={40}
								width={40}
							/>
						</div>
					) : (
						<div className='text-lg text-red-600 font-semibold'>{txError}</div>
					)
				) : (
					<div></div>
				)
			) : (
				<div className='flex flex-col justify-center items-center'>
					<div className='font-semibold text-lg text-center mb-4'>
						Minted!
					</div>

				</div>
			)} */}
			<div>
				<p classname="hover:underline"><i>Collection by <a href="https://twitter.com/jenna_koppinger">Jenna Koppinger</a></i></p>
				<p classname="hover:underline"><i>Code by <a href="https://www.linkedin.com/in/parkernolan/">Parker Nolan</a></i></p>
			</div>
		</div>
	)
}

export default mint