import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useState } from "react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";

type PlayProps = {
  userSession: Session;
};

enum EGameState {
  UserChoosingPlaylist,
  LoadingPlaylistSongs,
  WaitingForUserToClickPlay,
  PlayingSong,
  EndScreen,
}

const Game = () => {
  const playlists = trpc.useQuery([
    "spotify.get-user-playlists",
    { offset: 0 },
  ]);
  const [gameState, setGameState] = useState<EGameState>(
    EGameState.UserChoosingPlaylist
  );
  const [gamePlaylist, setGamePlaylist] = useState<Record<string, any>>();

  return (
    <>
      {!playlists.isLoading &&
        playlists.data?.items.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => {
              setGamePlaylist(playlist);
              setGameState(EGameState.LoadingPlaylistSongs);
            }}
          >
            {playlist.name}
          </div>
        ))}
    </>
  );
};

const Play: NextPage<PlayProps> = ({ userSession }) => {
  return (
    <>
      <Head>
        <title>Play Spotify Quiz!</title>
      </Head>
      <>
        <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
          <Game />
        </main>
      </>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PlayProps> = async (
  ctx
) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      userSession: session,
    },
  };
};

export default Play;
