import type { NextPage } from "next";
import { signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const session = trpc.useQuery(["auth.get-session"]);

  return (
    <>
      <Head>
        <title>Spotify Quiz!</title>
        <meta name="description" content="Spotify quiz" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        {session.data ? (
          <div>
            <Link href="/play">
              <button className="w-32 bg-black text-white font-extrabold text-4xl px-6 py-3 border-green-900 border-2 rounded-lg hover:bg-green-400">
                Play!
              </button>
            </Link>

            <button onClick={() => signOut()}>Log out</button>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                signIn("spotify");
              }}
              className="w-auto bg-black text-white font-extrabold text-4xl px-6 py-3 border-green-900 border-2 rounded-lg hover:bg-green-400"
            >
              Sign in with Spotify
            </button>
          </>
        )}
      </main>
    </>
  );
};

export default Home;
