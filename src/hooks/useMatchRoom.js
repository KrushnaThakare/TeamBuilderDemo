import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { defaultPlayers } from '../data/defaultPlayers';

const ROOM_ID = 'default';
const initialMatch = {
  teamA: [],
  teamB: [],
  captains: {
    teamA: '',
    teamB: '',
  },
  scores: {
    teamA: '',
    teamB: '',
  },
  innings: {
    first: 'teamA',
    second: 'teamB',
  },
  updatedAt: Date.now(),
};

const fallbackState = {
  players: defaultPlayers,
  match: initialMatch,
};

const normalizeMatch = (match = {}) => ({
  ...initialMatch,
  ...match,
  captains: {
    ...initialMatch.captains,
    ...(match.captains || {}),
  },
  scores: {
    ...initialMatch.scores,
    ...(match.scores || {}),
  },
  innings: {
    ...initialMatch.innings,
    ...(match.innings || {}),
  },
  teamA: Array.isArray(match.teamA) ? match.teamA : [],
  teamB: Array.isArray(match.teamB) ? match.teamB : [],
});

export function useMatchRoom() {
  const [state, setState] = useState(fallbackState);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');

  const refs = useMemo(() => {
    if (!isFirebaseConfigured) {
      return null;
    }

    return {
      match: doc(db, 'matches', ROOM_ID),
      players: collection(db, 'matches', ROOM_ID, 'players'),
    };
  }, []);

  useEffect(() => {
    if (!refs) {
      return undefined;
    }

    let matchLoaded = false;
    let playersLoaded = false;

    const stopMatch = onSnapshot(
      refs.match,
      async (snapshot) => {
        if (!snapshot.exists()) {
          await setDoc(refs.match, initialMatch);
          return;
        }

        matchLoaded = true;
        setState((current) => ({
          ...current,
          match: normalizeMatch(snapshot.data()),
        }));
        setLoading(!(matchLoaded && playersLoaded));
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    const stopPlayers = onSnapshot(
      refs.players,
      async (snapshot) => {
        if (snapshot.empty) {
          await Promise.all(
            defaultPlayers.map((player) =>
              setDoc(doc(refs.players, player.id), player, { merge: true }),
            ),
          );
          return;
        }

        playersLoaded = true;
        setState((current) => ({
          ...current,
          players: snapshot.docs
            .map((playerDoc) => ({
              id: playerDoc.id,
              ...playerDoc.data(),
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));
        setLoading(!(matchLoaded && playersLoaded));
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => {
      stopMatch();
      stopPlayers();
    };
  }, [refs]);

  const withFirestore = async (action) => {
    if (!refs) {
      setError('Firebase is not configured yet.');
      return;
    }

    try {
      setError('');
      await action();
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  const updateLocalMatch = (updater) => {
    setState((current) => ({
      ...current,
      match: normalizeMatch(updater(current.match)),
    }));
  };

  const addPlayer = async (player) => {
    const name = player.name.trim();
    const photoUrl =
      player.photo?.trim() ||
      player.photoUrl?.trim() ||
      `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;
    const newPlayer = {
      id: crypto.randomUUID(),
      name,
      photo: photoUrl,
      photoUrl,
    };

    if (!refs) {
      setState((current) => ({
        ...current,
        players: [...current.players, newPlayer].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      return;
    }

    await withFirestore(() => setDoc(doc(refs.players, newPlayer.id), newPlayer));
  };

  const selectPlayer = async (teamKey, playerId) => {
    if (!refs) {
      updateLocalMatch((match) => {
        if (match.teamA.includes(playerId) || match.teamB.includes(playerId)) {
          return match;
        }

        const otherTeam = teamKey === 'teamA' ? 'teamB' : 'teamA';
        return {
          ...match,
          [teamKey]: [...match[teamKey], playerId],
          [otherTeam]: match[otherTeam].filter((id) => id !== playerId),
          updatedAt: Date.now(),
        };
      });
      return;
    }

    await withFirestore(() =>
      runTransaction(db, async (transaction) => {
        const matchSnapshot = await transaction.get(refs.match);
        const match = normalizeMatch(matchSnapshot.data());
        const otherTeam = teamKey === 'teamA' ? 'teamB' : 'teamA';

        if (match.teamA.includes(playerId) || match.teamB.includes(playerId)) {
          return;
        }

        transaction.update(refs.match, {
          [teamKey]: [...match[teamKey], playerId],
          [otherTeam]: match[otherTeam].filter((id) => id !== playerId),
          updatedAt: Date.now(),
        });
      }),
    );
  };

  const removePlayerFromTeam = async (teamKey, playerId) => {
    if (!refs) {
      updateLocalMatch((match) => ({
        ...match,
        [teamKey]: match[teamKey].filter((id) => id !== playerId),
        captains: {
          ...match.captains,
          [teamKey]: match.captains[teamKey] === playerId ? '' : match.captains[teamKey],
        },
        updatedAt: Date.now(),
      }));
      return;
    }

    await withFirestore(() =>
      runTransaction(db, async (transaction) => {
        const matchSnapshot = await transaction.get(refs.match);
        const match = normalizeMatch(matchSnapshot.data());

        transaction.update(refs.match, {
          [teamKey]: match[teamKey].filter((id) => id !== playerId),
          [`captains.${teamKey}`]: match.captains[teamKey] === playerId ? '' : match.captains[teamKey],
          updatedAt: Date.now(),
        });
      }),
    );
  };

  const swapPlayer = async (playerId, targetTeam) => {
    if (!refs) {
      updateLocalMatch((match) => {
        const sourceTeam = targetTeam === 'teamA' ? 'teamB' : 'teamA';
        if (!match[sourceTeam].includes(playerId) || match[targetTeam].includes(playerId)) {
          return match;
        }

        return {
          ...match,
          [sourceTeam]: match[sourceTeam].filter((id) => id !== playerId),
          [targetTeam]: [...match[targetTeam], playerId],
          captains: {
            ...match.captains,
            [sourceTeam]: match.captains[sourceTeam] === playerId ? '' : match.captains[sourceTeam],
          },
          updatedAt: Date.now(),
        };
      });
      return;
    }

    await withFirestore(() =>
      runTransaction(db, async (transaction) => {
        const matchSnapshot = await transaction.get(refs.match);
        const match = normalizeMatch(matchSnapshot.data());
        const sourceTeam = targetTeam === 'teamA' ? 'teamB' : 'teamA';

        if (!match[sourceTeam].includes(playerId) || match[targetTeam].includes(playerId)) {
          return;
        }

        transaction.update(refs.match, {
          [sourceTeam]: match[sourceTeam].filter((id) => id !== playerId),
          [targetTeam]: [...match[targetTeam], playerId],
          [`captains.${sourceTeam}`]:
            match.captains[sourceTeam] === playerId ? '' : match.captains[sourceTeam],
          updatedAt: Date.now(),
        });
      }),
    );
  };

  const updateCaptain = async (teamKey, playerId) => {
    if (!refs) {
      updateLocalMatch((match) => ({
        ...match,
        captains: {
          ...match.captains,
          [teamKey]: playerId,
        },
        updatedAt: Date.now(),
      }));
      return;
    }

    await withFirestore(() =>
      setDoc(
        refs.match,
        {
          captains: {
            [teamKey]: playerId,
          },
          updatedAt: Date.now(),
        },
        { merge: true },
      ),
    );
  };

  const updateScore = async (teamKey, score) => {
    if (!refs) {
      updateLocalMatch((match) => ({
        ...match,
        scores: {
          ...match.scores,
          [teamKey]: score,
        },
        updatedAt: Date.now(),
      }));
      return;
    }

    await withFirestore(() =>
      setDoc(
        refs.match,
        {
          scores: {
            [teamKey]: score,
          },
          updatedAt: Date.now(),
        },
        { merge: true },
      ),
    );
  };

  const resetMatch = async () => {
    if (!refs) {
      setState((current) => ({ ...current, match: initialMatch, players: defaultPlayers }));
      return;
    }

    await withFirestore(() => setDoc(refs.match, initialMatch));
  };

  const restoreDefaultPlayers = async () => {
    if (!refs) {
      setState((current) => ({
        ...current,
        players: [
          ...new Map([...current.players, ...defaultPlayers].map((player) => [player.id, player])).values(),
        ].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      return;
    }

    await withFirestore(async () => {
      await Promise.all(
        defaultPlayers.map((player) => setDoc(doc(refs.players, player.id), player, { merge: true })),
      );
    });
  };

  const deletePlayer = async (playerId) => {
    if (!refs) {
      setState((current) => ({
        players: current.players.filter((player) => player.id !== playerId),
        match: normalizeMatch({
          ...current.match,
          teamA: current.match.teamA.filter((id) => id !== playerId),
          teamB: current.match.teamB.filter((id) => id !== playerId),
          captains: {
            teamA: current.match.captains.teamA === playerId ? '' : current.match.captains.teamA,
            teamB: current.match.captains.teamB === playerId ? '' : current.match.captains.teamB,
          },
          updatedAt: Date.now(),
        }),
      }));
      return;
    }

    await withFirestore(async () => {
      await runTransaction(db, async (transaction) => {
        const matchSnapshot = await transaction.get(refs.match);
        const match = normalizeMatch(matchSnapshot.data());

        transaction.update(refs.match, {
          teamA: match.teamA.filter((id) => id !== playerId),
          teamB: match.teamB.filter((id) => id !== playerId),
          'captains.teamA': match.captains.teamA === playerId ? '' : match.captains.teamA,
          'captains.teamB': match.captains.teamB === playerId ? '' : match.captains.teamB,
          updatedAt: Date.now(),
        });
      });
      await deleteDoc(doc(refs.players, playerId));
    });
  };

  return {
    ...state,
    loading,
    error,
    isFirebaseConfigured,
    addPlayer,
    deletePlayer,
    removePlayerFromTeam,
    resetMatch,
    restoreDefaultPlayers,
    selectPlayer,
    swapPlayer,
    updateCaptain,
    updateScore,
  };
}
