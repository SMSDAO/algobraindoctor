/**
 * Web3 wallet integration service.
 *
 * Provides wallet connection, session management, and signature-based
 * authentication binding. Designed for EVM-compatible wallets via
 * browser provider injection (MetaMask / EIP-1193) with a clear
 * WalletConnect extension point.
 *
 * NOTE: This module performs no on-chain writes and no fund transfers.
 * It is used solely for identity verification via signature.
 */

import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WalletProvider = 'injected' | 'walletconnect'

export interface WalletSession {
  address: string
  chainId: number
  provider: WalletProvider
  connectedAt: string
}

export interface SignatureChallenge {
  message: string
  nonce: string
  issuedAt: string
}

export interface SignatureVerification {
  address: string
  valid: boolean
  message: string
  signature: string
}

// ---------------------------------------------------------------------------
// EIP-1193 window.ethereum type
// ---------------------------------------------------------------------------

interface EthereumProvider {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>
  on(event: string, handler: (...args: unknown[]) => void): void
  removeListener(event: string, handler: (...args: unknown[]) => void): void
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

// ---------------------------------------------------------------------------
// Session store (in-memory; integrate with Firebase/KV for persistence)
// ---------------------------------------------------------------------------

let _session: WalletSession | null = null

/** Get the current wallet session, or null if not connected. */
export function getWalletSession(): WalletSession | null {
  return _session
}

/** Clear the current wallet session. */
export function clearWalletSession(): void {
  _session = null
  logger.info('Wallet session cleared')
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

/**
 * Connect to an injected EIP-1193 wallet (e.g. MetaMask).
 *
 * For WalletConnect support, integrate the @walletconnect/ethereum-provider
 * package and set VITE_WALLETCONNECT_PROJECT_ID in your .env file.
 */
export async function connectWallet(provider: WalletProvider = 'injected'): Promise<WalletSession> {
  if (provider === 'walletconnect') {
    throw new Error(
      'WalletConnect support requires @walletconnect/ethereum-provider. ' +
        'Install the package and configure VITE_WALLETCONNECT_PROJECT_ID.',
    )
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error(
      'No EIP-1193 wallet detected. Install MetaMask or another browser wallet.',
    )
  }

  const ethereum = window.ethereum

  const accounts = await ethereum.request<string[]>({
    method: 'eth_requestAccounts',
  })

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned from wallet. User may have rejected the connection.')
  }

  const chainIdHex = await ethereum.request<string>({ method: 'eth_chainId' })
  const chainId = parseInt(chainIdHex, 16)

  _session = {
    address: accounts[0].toLowerCase(),
    chainId,
    provider,
    connectedAt: new Date().toISOString(),
  }

  logger.info('Wallet connected', { address: _session.address, chainId })

  // Set up disconnect listener
  ethereum.on('accountsChanged', (accs: unknown) => {
    const accounts = accs as string[]
    if (!accounts || accounts.length === 0) {
      clearWalletSession()
    } else {
      if (_session) {
        _session = { ..._session, address: accounts[0].toLowerCase() }
        logger.info('Wallet account changed', { address: _session.address })
      }
    }
  })

  ethereum.on('chainChanged', (chainIdHex: unknown) => {
    const newChainId = parseInt(chainIdHex as string, 16)
    if (_session) {
      _session = { ..._session, chainId: newChainId }
      logger.info('Wallet chain changed', { chainId: newChainId })
    }
  })

  return _session
}

// ---------------------------------------------------------------------------
// Signature-based authentication
// ---------------------------------------------------------------------------

/**
 * Generate a sign-in challenge message (EIP-4361 / SIWE-compatible format).
 */
export function createSignInChallenge(address: string, domain = 'algobraindoctor.app'): SignatureChallenge {
  const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const issuedAt = new Date().toISOString()
  const message = [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    ``,
    `Sign in to AlgoBrainDoctor`,
    ``,
    `URI: https://${domain}`,
    `Version: 1`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')

  return { message, nonce, issuedAt }
}

/**
 * Request the connected wallet to sign an authentication challenge.
 */
export async function signChallenge(challenge: SignatureChallenge): Promise<string> {
  if (!_session) {
    throw new Error('No wallet connected. Call connectWallet() first.')
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No EIP-1193 wallet detected.')
  }

  const signature = await window.ethereum.request<string>({
    method: 'personal_sign',
    params: [challenge.message, _session.address],
  })

  logger.info('Challenge signed', { address: _session.address })
  return signature
}

/**
 * Verify a wallet signature on the client side (basic check).
 *
 * For full server-side verification, use ethers.js `verifyMessage` in your
 * API route or backend service. This client-side function provides a
 * structural validation only.
 */
export function verifySignature(
  address: string,
  message: string,
  signature: string,
): SignatureVerification {
  // Basic structural validation
  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(address)
  const isValidSig = /^0x[0-9a-fA-F]{130}$/.test(signature)
  const hasMessage = message.length > 0

  const valid = isValidAddress && isValidSig && hasMessage

  if (!valid) {
    logger.warn('Signature verification failed structural check', {
      isValidAddress,
      isValidSig,
      hasMessage,
    })
  }

  return { address, valid, message, signature }
}
