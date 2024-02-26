import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import { requestAirdrop } from "./airdrop-sol";
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(clusterApiUrl('devnet'));
const senderKeypair = getKeypairFromEnvironment("SENDER_SECRET_KEY");

//requestAirdrop(connection, senderKeypair, 1);

const PING_PROGRAM_ADDRESS = new PublicKey('ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa')
const PING_PROGRAM_DATA_ADDRESS = new PublicKey('Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod')

const transaction = new Transaction();
const instruction = new TransactionInstruction({
    keys: [
        {   pubkey: PING_PROGRAM_DATA_ADDRESS,
            isSigner: false,
            isWritable: true
        }
    ],
    programId: PING_PROGRAM_ADDRESS
})

transaction.add(instruction)

const result = await sendAndConfirmTransaction(connection, transaction, [senderKeypair])
console.log(result)
