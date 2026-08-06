// Connects to browser-extension wallets to read the user's public address.
// These calls only request the account address (eth_requestAccounts /
// solana connect) — they never request a transaction or signature.

function getEthProviders() {
  if (typeof window === "undefined" || !window.ethereum) return [];
  return window.ethereum.providers?.length ? window.ethereum.providers : [window.ethereum];
}

export function isMetaMaskAvailable() {
  return getEthProviders().some((p) => p.isMetaMask);
}

export function isCoinbaseWalletAvailable() {
  return getEthProviders().some((p) => p.isCoinbaseWallet);
}

export function isPhantomAvailable() {
  return !!(window.phantom?.solana?.isPhantom || window.solana?.isPhantom);
}

export async function connectMetaMask() {
  const provider = getEthProviders().find((p) => p.isMetaMask);
  if (!provider) {
    throw new Error("MetaMask isn't installed. Get it at metamask.io.");
  }
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts?.[0]) throw new Error("No account returned by MetaMask.");
  return accounts[0];
}

export async function connectCoinbaseWallet() {
  const provider = getEthProviders().find((p) => p.isCoinbaseWallet);
  if (!provider) {
    throw new Error("Coinbase Wallet isn't installed. Get it at coinbase.com/wallet.");
  }
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts?.[0]) throw new Error("No account returned by Coinbase Wallet.");
  return accounts[0];
}

export async function connectPhantom() {
  const provider = window.phantom?.solana?.isPhantom ? window.phantom.solana : window.solana?.isPhantom ? window.solana : null;
  if (!provider) {
    throw new Error("Phantom isn't installed. Get it at phantom.app.");
  }
  const resp = await provider.connect();
  const address = resp?.publicKey?.toString();
  if (!address) throw new Error("No account returned by Phantom.");
  return address;
}
