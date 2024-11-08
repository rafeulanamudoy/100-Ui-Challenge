import React, { useEffect, useRef, useState } from "react";

export default function Players() {
  const player1Ref = useRef<HTMLInputElement>(null);
  const player2Ref = useRef<HTMLInputElement>(null);
  const [disable1, setDisable1] = useState(false);
  const [disable2, setDisable2] = useState(false);
  const [player1words, setPlayer1Words] = useState<string[]>([]);
  const [player2words, setPlayer2Words] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUi, setShowUi] = useState(false);

  const [timer1, setTimer1] = useState(10);
  const [timer2, setTimer2] = useState(10);
  const [totalScore1, setTotalScore1] = useState(125);
  const [totalScore2, setTotalScore2] = useState(125);

  const validateWord = async (word: string) => {
    try {
      const response = await fetch(
        ` https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const result = await response.json();
      return result[0]?.phonetics?.length > 0;
    } catch (error) {
      console.error("Error fetching word:", error);
      return false;
    }
  };
  const resetTimers = () => {
    setTimer1(10);
    setTimer2(10);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!disable1 && showUi) {
      interval = setInterval(() => {
        setTimer1((prev) => {
          if (prev === -5) {
            setDisable1(true);
            setDisable2(false);
            setTotalScore2((score) => score + 5); // Bonus for player 2
            player2Ref.current?.focus();
            resetTimers();
            return 10; // reset timer after switch
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!disable2 && showUi) {
      interval = setInterval(() => {
        setTimer2((prev) => {
          if (prev === -5) {
            setDisable2(true);
            setDisable1(false);
            setTotalScore1((score) => score + 5); // Bonus for player 1
            player1Ref.current?.focus();
            resetTimers();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [disable1, disable2]);
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    player: string
  ) => {
    e.preventDefault();

    const playerRef = player === "player1" ? player1Ref : player2Ref;

    const setPlayerWords =
      player === "player1" ? setPlayer1Words : setPlayer2Words;
    const setTotalScore =
      player === "player1" ? setTotalScore1 : setTotalScore2;
    const disableCurrent = player === "player1" ? setDisable1 : setDisable2;
    const disableNext = player === "player1" ? setDisable2 : setDisable1;
    const nextPlayerRef = player === "player1" ? player2Ref : player1Ref;
    const Player1LastWords = player1words.length
      ? player1words[player1words.length - 1].split("")
      : [];
    const Player1lastWord = Player1LastWords.length
      ? Player1LastWords[Player1LastWords.length - 1]
      : "";

    const player2LastWords = player2words.length
      ? player2words[player2words.length - 1].split("")
      : [];
    const Player2lastWord = player2LastWords.length
      ? player2LastWords[player2LastWords.length - 1]
      : "";

    if (
      playerRef === player1Ref &&
      player2words.length &&
      playerRef.current &&
      !playerRef.current.value.startsWith(Player2lastWord)
    ) {
      alert(`must start with ${Player2lastWord}`);
    } else if (
      playerRef === player2Ref &&
      player1words.length &&
      playerRef.current &&
      !playerRef.current.value.startsWith(Player1lastWord)
    ) {
      alert(`must start with ${Player1lastWord}`);
    } else if (playerRef?.current && playerRef?.current?.value.length < 4) {
      alert("Minimum length is 4");
    } else if (playerRef.current) {
      const word = playerRef.current.value;

      setIsLoading(true);
      const isValid = await validateWord(word);
      setIsLoading(false);

      if (isValid) {
        setPlayerWords((prevWords) => [...prevWords, word]);
        setTotalScore((prev) => {
          const newScore = prev - word.length * 2;
          return newScore;
        });
        playerRef.current.value = "";

        disableCurrent(true);
        disableNext(false);
        nextPlayerRef.current?.focus();
        resetTimers();
      } else {
        alert("Invalid word");
      }
    }
  };

  return (
    <div>
      {showUi ? (
        <div className={`grid grid-cols-2 gap-3 w-1/2 mx-auto my-5`}>
          <div className="white-shadow grid bg-black">
            <div className=" flex text-white justify-between mx-5">
              <h1>{totalScore1}</h1>
              <h1>{timer1}</h1>
            </div>
            <h1 className="text-center  text-white">Player 1</h1>
            <form onSubmit={(e) => handleSubmit(e, "player1")} className="grid">
              <input
                ref={player1Ref}
                disabled={disable1 || isLoading}
                className="border-2 justify-center w-[90%] mx-auto py-2 my-2"
                type="text"
              />
              {player1words.map((playerWord, index) => (
                <div key={index} className="grid justify-center mb-2">
                  <h1 className="text-white">{playerWord}</h1>
                </div>
              ))}
              <button
                type="submit"
                disabled={isLoading}
                className="text-white border-2 w-1/2 mx-auto bg-blue-500 mb-2"
              >
                Next
              </button>
            </form>
          </div>
          <div className="white-shadow grid bg-black">
            <div className=" flex justify-between mx-5 text-white">
              <h1>{totalScore2}</h1>
              <h1>{timer2}</h1>
            </div>
            <h1 className="text-center text-white">Player 2</h1>
            <form onSubmit={(e) => handleSubmit(e, "player2")} className="grid">
              <input
                ref={player2Ref}
                disabled={disable2 || isLoading}
                className="border-2 justify-center w-[90%] mx-auto py-2 my-2"
                type="text"
              />
              {player2words.map((playerWord, index) => (
                <div key={index} className="grid justify-center mb-2">
                  <h1 className="text-white">{playerWord}</h1>
                </div>
              ))}
              <button
                type="submit"
                disabled={isLoading}
                className="text-white border-2 w-1/2 mx-auto bg-blue-500 mb-2"
              >
                Next
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowUi(true)}
          type="button"
          className="  text-center grid justify-self-center  my-5 text-gray-900  bg-green-500 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          {" "}
          Lets Start To Play
        </button>
      )}
    </div>
  );
}
