import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Web3 from 'web3';
import ReCAPTCHA from 'react-google-recaptcha';

const tokenAddress = '0xbcc3f69C62cE39cd516bB35D6EE4307EF70117bE'; // Replace with your token address
const tokenABI = [ [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_totalSupply","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}] ]; // Replace with your token ABI

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [isClaimButtonDisabled, setIsClaimButtonDisabled] = useState(false);

  const web3 = useMemo(() => new Web3(window.ethereum), []);
  const contract = useMemo(() => new web3.eth.Contract(tokenABI, tokenAddress), [web3]);

  const fetchBalance = useCallback(async () => {
    if (account) {
      try {
        const balance = await contract.methods.balanceOf(account).call();
        setBalance(web3.utils.fromWei(balance, 'ether'));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  }, [account, contract, web3.utils]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const chainId = await web3.eth.getChainId();
        if (chainId !== 25) { // 25 is the decimal equivalent of 0x19
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x19' }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x19',
                      chainName: 'Cronos Mainnet',
                      rpcUrls: ['https://evm-cronos.crypto.org'],
                      blockExplorerUrls: ['https://cronoscan.com'],
                      nativeCurrency: {
                        name: 'Cronos',
                        symbol: 'CRO',
                        decimals: 18,
                      },
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add the Cronos network:", addError);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert('Please install MetaMask to use this feature.');
    }
  };

  const handleClaim = async () => {
    if (!recaptchaVerified) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    try {
      const gasEstimate = await contract.methods.claimTokens().estimateGas({ from: account });
      await contract.methods.claimTokens().send({ from: account, gas: gasEstimate });
      alert('Tokens claimed successfully');
      setIsClaimButtonDisabled(true);
      setTimeout(() => setIsClaimButtonDisabled(false), 24 * 60 * 60 * 1000); // 24-hour lock period
      fetchBalance(); // Update balance after claiming
    } catch (error) {
      console.error('Error claiming tokens:', error);
      alert('Failed to claim tokens');
    }
  };

  const onRecaptchaChange = (value) => {
    console.log('reCAPTCHA value:', value);
    setRecaptchaVerified(true);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>My Token App</h1>
      <button onClick={connectWallet}>Connect to Wallet</button>
      {account && (
        <>
          <p>Connected Account: {account}</p>
          <p>Token Balance: {balance}</p>
          <ReCAPTCHA
            sitekey="6Lfu7P0pAAAAAL3ZPbvqaV7BjxnCkP054uQQX6EI" // Replace with your reCAPTCHA site key
            onChange={onRecaptchaChange}
          />
          <button onClick={handleClaim} disabled={!recaptchaVerified || isClaimButtonDisabled}>
            Claim Tokens
          </button>
        </>
      )}
    </div>
  );
};

export default App;
