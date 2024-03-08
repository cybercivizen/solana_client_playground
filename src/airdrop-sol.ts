import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function requestAirdrop(connection: Connection, accountKeypair: Keypair, amountInSOL: number) {
    try {
        const signature = await connection.requestAirdrop(accountKeypair.publicKey, amountInSOL * LAMPORTS_PER_SOL)
        const latestBlockHash = await connection.getLatestBlockhash();

        const result = await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature
        });
        
        console.log('Airdrop successful:', result);
    } catch (error) {
        console.error('Airdrop failed:', error);
    }

}
