import * as borsh from '@coral-xyz/borsh';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmTransaction } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

const PROGRAM_ID = new PublicKey('CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN');
const connection = new Connection(clusterApiUrl('devnet'));
const payer = getKeypairFromEnvironment('SENDER_SECRET_KEY');

class Movie {
    title: string;
    rating: number;
    description: string;

    constructor(title: string, rating: number, description: string) {
        this.title = title;
        this.rating = rating;
        this.description = description;
    }

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.str('title'),
        borsh.u8('rating'),
        borsh.str('description')
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('initialized'),
        borsh.u8('rating'),
        borsh.str('title'),
        borsh.str('description'),
    ])

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000);
        this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
    }

    static deserialize(buffer: Buffer | undefined): Movie {
        const { title, rating, description } = this.borshAccountSchema.decode(buffer);
        return new Movie(title, rating, description);
    }
}

async function serializeAndSendMovieReview() {
    const movie = new Movie('Trainssssspotting', 0, '');
    const buffer = movie.serialize();

    const [pda] = PublicKey.findProgramAddressSync([payer.publicKey.toBuffer(), Buffer.from("1")], PROGRAM_ID);

    const transaction = new Transaction();
    const instruction = new TransactionInstruction({
        keys: [
            {
                pubkey: payer.publicKey,
                isSigner: true,
                isWritable: false
            },
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true,
            }, {
                pubkey: SystemProgram.programId,
                isSigner: false,
                isWritable: false
            }
        ],
        programId: PROGRAM_ID,
        data: buffer
    })

    transaction.add(instruction);
    const txid = await sendAndConfirmTransaction(connection, transaction, [payer]);
    console.log(txid);
}

async function deserializeMoviesReviews() {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    const movies: Movie[] = accounts.map(({ account }) => Movie.deserialize(account.data))

    console.log(movies);
}

async function filterMoviesReviews() {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        dataSlice: { offset: 0, length: 0 } // Fetch minimal data if you're going to fetch them again later
    });

    // Fetch detailed info for each account (consider doing this in pages or batches for performance)
    const accountInfos = await connection.getMultipleAccountsInfo(accounts.map(acc => acc.pubkey).slice(0, 20));

    // Deserialize accounts into Movie objects
    // Assuming movies is an array that might contain undefined values
    const movies: (Movie | undefined)[] = accountInfos.map(info => info?.data ? Movie.deserialize(info.data) : undefined);

    // Filter out undefined values before sorting
    const definedMovies: Movie[] = movies.filter((movie): movie is Movie => movie !== undefined);

    // Sort movies by title
    definedMovies.sort((a, b) => a.title.localeCompare(b.title));

    console.log(definedMovies);

}

filterMoviesReviews();


