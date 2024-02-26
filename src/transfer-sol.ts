import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Transaction, SystemProgram, Keypair, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { requestAirdrop } from "./airdrop-sol";

import dotenv from 'dotenv';
dotenv.config();

const senderKeypair = getKeypairFromEnvironment("SENDER_SECRET_KEY")
const receiverKeypair = getKeypairFromEnvironment("RECEIVER_SECRET_KEY")

const SOL_TO_SEND = 1000

const connection = new Connection("http://localhost:8899")
const transaction = new Transaction();

const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: senderKeypair.publicKey,
    toPubkey: receiverKeypair.publicKey,
    lamports: SOL_TO_SEND * LAMPORTS_PER_SOL
})

transaction.add(sendSolInstruction)

const signature = await sendAndConfirmTransaction(connection, transaction, [
    senderKeypair,
  ]);

console.log(signature);
  

