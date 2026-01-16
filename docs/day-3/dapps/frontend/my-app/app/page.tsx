'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  type BaseError,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, Wallet, RefreshCw, Send, ExternalLink, ShieldCheck, FileCode2 } from 'lucide-react';

export default function Page() {
  // 🔹 WALLET STATE
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // 🔹 LOCAL STATE
  const [inputValue, setInputValue] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // 🔹 READ CONTRACT
  const {
    data: value,
    isLoading: isReading,
    refetch: refetchValue,
    isRefetching
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getValue',
  });

  const {
    data: ownerAddress,
    isLoading: isReadingOwner,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  // 🔹 WRITE CONTRACT
  const { writeContract, isPending: isWriting, error: writeError, data: writeHash } = useWriteContract();

  // 🔹 WAIT FOR TRANSACTION
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Effects for UX
  useEffect(() => {
    if (writeHash) {
      setTxHash(writeHash);
      toast.loading(
        <div className="flex flex-col gap-1">
          <span>Transaction submitted...</span>
          <a
            href={`https://testnet.snowtrace.io/tx/${writeHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View on Snowtrace <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        , { id: 'tx-toast', duration: Infinity });
    }
  }, [writeHash]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.dismiss('tx-toast');
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Transaction Confirmed!</span>
          <a
            href={`https://testnet.snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 underline"
          >
            View details on Snowtrace <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        , { duration: 5000 });

      setInputValue('');
      refetchValue();
      setTxHash(undefined);
    }
  }, [isConfirmed, refetchValue, txHash]);

  useEffect(() => {
    if (writeError) {
      const errorMsg = (writeError as BaseError).shortMessage || writeError.message;
      toast.error(`Transaction failed: ${errorMsg}`, { id: 'tx-toast' });
    }
  }, [writeError]);

  const handleSetValue = () => {
    if (!inputValue) return;

    // Check if on correct network (Avalanche Fuji = 43113)
    if (chain?.id !== 43113) {
      toast.error('Wrong network! Please switch to Avalanche Fuji Testnet.');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'setValue',
        args: [BigInt(inputValue)],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black">
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1e1e1e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />

      <div className="w-full max-w-md glass-panel rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6 animate-fade-in border border-white/5">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">❄️</span>
            <h1 className="text-lg font-bold tracking-tight">Avalanche dApp</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-gray-400">
            <div className={`w-2 h-2 rounded-full ${isConnected ? (chain?.id === 43113 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500') : 'bg-red-500'}`} />
            {isConnected ? (chain?.id === 43113 ? 'Fuji Testnet' : 'Wrong Network') : 'Disconnected'}
          </div>
        </div>

        {/* WALLET CARD */}
        <div className="bg-card-bg rounded-2xl p-6 border border-white/5 shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Wallet Status</p>
                {isConnected && address ? (
                  <button
                    onClick={() => { navigator.clipboard.writeText(address); toast.success('Address copied!'); }}
                    className="font-mono text-xl font-semibold tracking-wide hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {shortenAddress(address)}
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">Copy</span>
                  </button>
                ) : (
                  <p className="text-xl font-semibold text-gray-500">Not Connected</p>
                )}
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>

            {!isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                disabled={isConnecting}
                className="w-full mt-4 bg-primary hover:bg-primary-hover text-black py-3 rounded-xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isConnecting ? <Loader2 className="animate-spin" /> : 'Connect Wallet'}
              </button>
            ) : (
              <button
                onClick={() => disconnect()}
                className="text-sm text-red-400 hover:text-red-300 font-medium underline decoration-red-400/30 underline-offset-4 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* CONTRACT INFO */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><FileCode2 className="w-3 h-3" /> Contract Address</span>
            <a
              href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {shortenAddress(CONTRACT_ADDRESS)} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Owner</span>
            {isReadingOwner ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <a
                href={`https://testnet.snowtrace.io/address/${ownerAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {ownerAddress ? shortenAddress(ownerAddress.toString()) : 'Unknown'} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* READ SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Storage Value</h2>
            <button
              onClick={() => refetchValue()}
              disabled={isReading || isRefetching}
              className="text-primary hover:text-primary-hover p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isReading || isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-black/30 rounded-2xl p-8 flex items-center justify-center border border-white/5 min-h-[120px]">
            {isReading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <div className="text-center">
                <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                  {value?.toString() ?? '0'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* WRITE SECTION */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block">Update Value</label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">#</span>
            </div>
            <input
              type="number"
              placeholder="Enter new uint256..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!isConnected || isWriting || isConfirming}
              className="w-full pl-10 pr-4 py-4 bg-card-bg border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600 font-mono text-lg"
            />
          </div>

          <button
            onClick={handleSetValue}
            disabled={!isConnected || isWriting || isConfirming || !inputValue}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
              ${!isConnected
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : (isWriting || isConfirming)
                  ? 'bg-primary/50 text-black/50 cursor-wait'
                  : 'bg-primary text-black hover:bg-primary-hover shadow-[0_0_20px_rgba(171,159,242,0.3)] hover:shadow-[0_0_30px_rgba(171,159,242,0.5)] transform active:scale-98'
              }
            `}
          >
            {isWriting || isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isWriting ? 'Check Wallet...' : 'Confirming...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Set New Value
              </>
            )}
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
            Secured by Avalanche
          </p>
        </div>

      </div>
    </main>
  );
}
