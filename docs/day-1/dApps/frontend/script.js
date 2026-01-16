const connectBtn = document.getElementById('connectBtn');
const statusText = document.getElementById('status');
const addressText = document.getElementById('address');
const networkText = document.getElementById('network');
const balanceText = document.getElementById('balance');
const errorText = document.getElementById('error');

const FUJI_CHAIN_ID = '0xa869'; // 43113

// Check if wallet is already connected on load
async function init() {
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      handleAccountsChanged(accounts);
    }
  } else {
    errorText.innerText = 'Core Wallet not detected! Please install it.';
  }
}

async function connectWallet() {
  errorText.innerText = '';
  if (typeof window.ethereum !== 'undefined') {
    try {
      connectBtn.disabled = true;
      connectBtn.innerText = 'Connecting...';

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);

    } catch (err) {
      console.error(err);
      errorText.innerText = err.message || 'Connection failed';
    } finally {
      connectBtn.disabled = false;
      connectBtn.innerText = 'Connect Wallet';
    }
  } else {
    errorText.innerText = 'Core Wallet not detected!';
    window.open('https://core.app/', '_blank');
  }
}

async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // Disconnected
    statusText.innerText = 'Not Connected';
    statusText.className = 'disconnected';
    addressText.innerText = '-';
    networkText.innerText = '-';
    balanceText.innerText = '-';
    connectBtn.disabled = false;
    connectBtn.innerText = 'Connect Wallet';
  } else {
    const account = accounts[0];
    statusText.innerText = 'Connected';
    statusText.className = 'connected';

    // Shorten address
    addressText.innerText = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    addressText.title = account; // Show full on hover

    connectBtn.innerText = 'Wallet Connected';
    connectBtn.disabled = true;

    updateNetworkAndBalance(account);
  }
}

async function updateNetworkAndBalance(account) {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (chainId === FUJI_CHAIN_ID) {
      networkText.innerText = 'Avalanche Fuji';
      networkText.className = 'fuji';
    } else {
      networkText.innerText = 'Wrong Network (Please switch to Fuji)';
      networkText.className = '';
    }

    // Fetch Balance
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [account, 'latest']
    });

    // Convert hex to decimal AVAX (18 decimals)
    const balanceWei = BigInt(balanceHex);
    const balanceAvax = Number(balanceWei) / 1e18;
    balanceText.innerText = balanceAvax.toFixed(4);

  } catch (err) {
    console.error(err);
  }
}

// Event Listeners
if (window.ethereum) {
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', () => window.location.reload());
}

connectBtn.addEventListener('click', connectWallet);

init();