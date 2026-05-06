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

// Named event-handler references — stored so they can be removed before
// re-registering on reconnect, preventing duplicate listener accumulation.
let _accountsChangedHandler: ((accs: unknown) => void) | null = null
let _chainChangedHandler: ((chainIdHex: unknown) => void) | null = null

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

  // Remove any previously registered listeners before adding new ones to
  // prevent duplicate handlers from accumulating across reconnections.
  if (_accountsChangedHandler) {
    ethereum.removeListener('accountsChanged', _accountsChangedHandler)
  }
  if (_chainChangedHandler) {
    ethereum.removeListener('chainChanged', _chainChangedHandler)
  }

  _accountsChangedHandler = (accs: unknown) => {
    const accounts = accs as string[]
    if (!accounts || accounts.length === 0) {
      clearWalletSession()
    } else {
      if (_session) {
        _session = { ..._session, address: accounts[0].toLowerCase() }
        logger.info('Wallet account changed', { address: _session.address })
      }
    }
  }

  _chainChangedHandler = (chainIdHex: unknown) => {
    const newChainId = parseInt(chainIdHex as string, 16)
    if (_session) {
      _session = { ..._session, chainId: newChainId }
      logger.info('Wallet chain changed', { chainId: newChainId })
    }
  }

  ethereum.on('accountsChanged', _accountsChangedHandler)
  ethereum.on('chainChanged', _chainChangedHandler)

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
 * Check the structural format of a wallet signature.
 *
 * ⚠️  This is NOT cryptographic verification. It only validates that the
 * address and signature strings match the expected hex formats (0x-prefixed
 * 40-hex address + 65-byte signature). It does NOT validate the EIP-55
 * checksum, recover the signer from the signature, or compare it against
 * `address`.
 *
 * For real authentication use `ethers.verifyMessage(message, signature)`
 * (or equivalent) in a trusted server-side context, and compare the
 * recovered address to the expected address before granting access.
 */
export function checkSignatureFormat(
  address: string,
  message: string,
  signature: string,
): SignatureVerification {
  // Structural format checks only — NOT cryptographic verification
  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(address)
  const isValidSig = /^0x[0-9a-fA-F]{130}$/.test(signature)
  const hasMessage = message.length > 0

  const valid = isValidAddress && isValidSig && hasMessage

  if (!valid) {
    logger.warn('Signature format check failed', {
      isValidAddress,
      isValidSig,
      hasMessage,
    })
  }

  return { address, valid, message, signature }
}
