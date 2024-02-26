/*
    I)      Mint new token
    II)     Transfer tokens
    III)    Approve delegation / Revoke delegation
    IV)     Burn tokens  

    I) 
        1. Create mint account
        2. Create token associated account
        3. Mint token

    II)
        1. Create token associated account
        2. Transfer tokens
*/

import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import * as token from '@solana/spl-token'
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

import dotenv from 'dotenv';
dotenv.config();

const connection = new Connection(clusterApiUrl('devnet'));
const payer = getKeypairFromEnvironment('SENDER_SECRET_KEY');
const receiver = getKeypairFromEnvironment('RECEIVER_SECRET_KEY');

const {mint, associatedTokenAccount } = await mintTokens(connection, payer, 1000);
await transferTokens(connection, payer, associatedTokenAccount.address, receiver.publicKey, mint, 500);

async function mintTokens(connection: Connection, payer: Keypair, amount: number) {
    const mint = await token.createMint(connection, payer, payer.publicKey, payer.publicKey, 6);
    const mintInfo = await token.getMint(connection, mint);
    const associatedTokenAccount = await token.getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    const mintSignature = await token.mintTo(connection, payer, mint, associatedTokenAccount.address, payer, amount * 10 ** mintInfo.decimals);

    console.dir(`Tokens mint signature : https://explorer.solana.com/tx/${mintSignature}?cluster=devnet`)
    return { mint, associatedTokenAccount}
}

async function transferTokens(connection: Connection, payer: Keypair, payerTokenAccount: PublicKey, receiver: PublicKey, mint: PublicKey, amount: number) {
    const receiverTokenAccount = await token.getOrCreateAssociatedTokenAccount(connection, payer, mint, receiver);
    const transferSignature = await token.transfer(connection, payer, payerTokenAccount, receiverTokenAccount.address, payer, amount);
    console.dir(`Tokens transfer signature : https://explorer.solana.com/tx/${transferSignature}?cluster=devnet`)
}



/* // DEPRECATED //
async function createMintAccount(connection: Connection, payer: Keypair): Promise<PublicKey> {
    const tokenMint = await token.createMint(connection, payer, payer.publicKey, payer.publicKey, 6);
    return tokenMint
}

async function createAssociatedTokenAccount(connection: Connection, payer: Keypair, owner: PublicKey, mint: PublicKey): Promise<token.Account> {
    const associatedTokenAccount = await token.getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    return associatedTokenAccount;
}
*/

