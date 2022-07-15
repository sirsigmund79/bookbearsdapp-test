import { useState, useEffect } from 'react'
import { nftContractAddress } from '../config.js'
import { ethers } from 'ethers'

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

		const accounts = await ethereum.request({ method: 'eth_accounts' })

		if (accounts.length !== 0) {
			console.log('Found authorized Account: ', accounts[0])
			setCurrentAccount(accounts[0])
		} else {
			console.log('No authorized account found')
		}
	}

	// Calls Metamask to connect wallet on clicking Connect Wallet button
	const connectWallet = async () => {
		
		try {
			const { ethereum } = window

			if (!ethereum) {
				console.log('Metamask not detected')
				return
			}
			let chainId = await ethereum.request({ method: 'eth_chainId' })
			console.log('Connected to chain:' + chainId)

			const rinkebyChainId = '0x4'

			const devChainId = 1337
			const localhostChainId = `0x${Number(devChainId).toString(16)}`

			if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
				alert('You are not connected to the Rinkeby Testnet!')
				return
			}

			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

			console.log('Found account', accounts[0])
			setCurrentAccount(accounts[0])
		} catch (error) {
			console.log('Error connecting to metamask', error)
		}
	}

	// Checks if wallet is connected to the correct network
	const checkCorrectNetwork = async () => {
		const { ethereum } = window
		let chainId = await ethereum.request({ method: 'eth_chainId' })
		console.log('Connected to chain:' + chainId)

		const rinkebyChainId = '0x4'

		const devChainId = 1337
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
            value: ethers.utils.parseEther('0.0008'),
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
            `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTx.hash}`
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
					<div>Please connect to the Rinkeby Testnet</div>
					<div>and reload the page</div>
					<div>----------------------------------------</div>
				</div>
			)}

			<div className='text-xl font-semibold mb-20 mt-4'>
				<a
					href={`https://testnets.opensea.io/collection/bookbears-test-contract-q1ay3xfs3o`}
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
                <p>Success! Your Bookbear has minted. Check OpenSea on month, day to see what you got!</p>
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
		</div>
	)
}

export default mint