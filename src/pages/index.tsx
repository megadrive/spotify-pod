import type { NextPage } from "next";
import { signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "../component/Spinner";
import { trpc } from "../utils/trpc";

const ButtonWithLoading = ({
  children,
  onClick,
  loading = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${
        loading ? "w-44 grid justify-center" : "w-96 hover:bg-green-400"
      } bg-black text-white font-semibold text-2xl px-6 py-3 my-1 border-4 border-black hover:-rotate-1 disabled:bg-green-400 disabled:rotate-2 text-center transition-all ease-in duration-100`}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};

const Home: NextPage = () => {
  const session = trpc.useQuery(["auth.get-session"]);
  const [loading, setLoading] = useState(false);

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
              <ButtonWithLoading
                loading={loading}
                onClick={() => setLoading(true)}
              >
                Play!
              </ButtonWithLoading>
            </Link>

            <button onClick={() => signOut()}>Log out</button>
          </div>
        ) : (
          <>
            <ButtonWithLoading
              loading={loading}
              onClick={() => {
                setLoading(true);
                signIn("spotify");
              }}
            >
              Sign in with Spotify
            </ButtonWithLoading>
          </>
        )}
      </main>
    </>
  );
};

export default Home;
