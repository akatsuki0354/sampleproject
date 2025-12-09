"use client"
import { useEffect, useState } from "react"
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/animate-ui/components/radix/radio-group';
import { Label } from '@/components/ui/label';
import "aos/dist/aos.css";
import AOS from "aos"
import { Shuffle } from "@/utils/shuffle";
import { Button } from "@/components/ui/button";
import { MyTimer } from "@/hooks/timer";

type getDataQuiz = {
  id: number;
  question: string;
  choices: string[];
  answer: string;
};

export default function Home() {
  // id: 1, question: "What is 2 + 2?", choices: ["3", "4", "5", "6"], answer: "4"
  const [getQuiz, setGetQuiz] = useState<getDataQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<{ id: number; correct: boolean }[]>([])
  const [isGameStart, setIsGameStart] = useState(false)
  const [nextWarning, setNextWarning] = useState("");
  const [expiryTimestamp, setExpiryTimestamp] = useState<Date | null>(null);
  const [isTimeExpiredDialogOpen, setIsTimeExpiredDialogOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);

  const StartGame = () => {
    const time = new Date();
    //2 minutes timer
    time.setSeconds(time.getSeconds() + 120);
    setExpiryTimestamp(time);
    setIsGameStart(true);
    //expire timer start
    setIsTimeExpiredDialogOpen(false);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    })
  }, [])

  const PostAPI = async (id: number, value: string | undefined) => {
    try {
      if (!value) return
      await fetch('/api/grade', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ans: { id, value } })
      })
    } catch (error) {
      alert('Error posting score data:' + error)
    }
  }

  useEffect(() => {
    const GetAPI = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/quiz')
        const data = await res.json()
        const shuffledQuiz = Shuffle(data).map(item => ({
          ...item,
          choices: Shuffle(item.choices)
        }));
        setGetQuiz(shuffledQuiz)
      } catch (error) {
        alert('Error fetching quiz data:' + error)
      } finally {
        setTimeout(() => setLoading(false), 500)
      }
    }
    GetAPI()
  }, [])

  const hasQuiz = getQuiz.length > 0
  const visibleQuizzes = getQuiz.slice(currentIndex, currentIndex + 5)

  const HandleSubmitPage = async (): Promise<boolean> => {
    const missingAnswer = visibleQuizzes.some(q => !answers[q.id]);
    if (missingAnswer) {
      setNextWarning("Answer all questions before continuing.");
      return false;
    }
    setNextWarning("");

    for (const quiz of visibleQuizzes) {
      const value = answers[quiz.id];
      await PostAPI(quiz.id, value);
      const isCorrect = value === quiz.answer;

      setResults(prev => {
        const filtered = prev.filter(r => r.id !== quiz.id);
        return [...filtered, { id: quiz.id, correct: isCorrect }];
      });
    }

    const finished = currentIndex + 5 >= getQuiz.length;
    if (!finished) {
      setCurrentIndex(prev => prev + 5);
    }
    return finished;
  };

  const HandleNextOrFinish = async () => {
    if (isNextLoading) return;
    setIsNextLoading(true);
    try {
      const finished = await HandleSubmitPage();
      if (finished) {
        setIsTimerRunning(false);
        setTimeout(() => setShowResultsModal(true), 100);
      }
    } finally {
      setIsNextLoading(false);
    }
  };

  const ResetQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setResults([]);
    setNextWarning("");
    setShowResultsModal(false);
    setIsTimerRunning(false);
    const time = new Date();
    time.setSeconds(time.getSeconds() + 120);
    setExpiryTimestamp(time);
    setIsTimerRunning(true);
    setGetQuiz(prevQuiz => {
      if (!prevQuiz || prevQuiz.length === 0) return prevQuiz;
      return Shuffle(prevQuiz).map(item => ({
        ...item,
        choices: Shuffle(item.choices),
      }));
    });
  };

  const HandleTimeExpired = () => {
    setIsTimeExpiredDialogOpen(true);
    setIsTimerRunning(false);
  };

  const HandleRestart = () => {
    ResetQuiz();
    setIsTimeExpiredDialogOpen(false);
  };

  const score = results.filter(r => r.correct).length;

  return (
    <div className="bg-gray-100/10">

      {isTimeExpiredDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-900">Time&apos;s up!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Time is up. You can start over.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={HandleRestart}
                className="flex-1 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      )}

      {showResultsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <header className="mb-4">
              <h3 className="text-xl font-semibold">Results</h3>
            </header>

            <section className="mb-4">
              <p className="text-base font-semibold text-gray-900">
                Score:{" "}
                <span className={score >= getQuiz.length / 2 ? "text-green-600" : "text-red-600"}>
                  {score}
                </span>{" "}
                / {getQuiz.length}
              </p>

              <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">
                Answer summary
              </p>

              <ul className="mt-3 space-y-2 text-sm">
                {results.map((r, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      Question {i + 1}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.correct ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                    >
                      {r.correct ? "Correct" : "Incorrect"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <footer className="flex gap-3">
              <Button
                onClick={
                  ResetQuiz}
                className="flex-1 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
              >
                Reset
              </Button>

              <Button
                onClick={() => setShowResultsModal(false)}
                className="flex-1 border bg-black text-white"
              >
                Close
              </Button>
            </footer>
          </div>
        </div>
      )}

      {!isGameStart ? (
        <div className="flex justify-center place-items-center min-h-screen">
          <div>
            <h1 className="text-6xl text-center mb-3 font-bold">Mini Quiz</h1>
            <h1>This is Mini Quiz Game Start the button To get Started</h1>
            <div className="flex justify-center mt-5">
              <Button onClick={StartGame}>Start Game</Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="min-h-screen flex flex-col justify-center items-center space-y-4 ">
              <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-2xl font-semibold text-gray-700">Loading...</div>
            </div>
          ) : !hasQuiz ? (
            <div className="min-h-screen flex justify-center items-center">
              <p className="text-gray-500">No Mini quiz data available.</p>
            </div>
          ) : (
            <div className="flex justify-center ">
              <div className="min-h-screen pb-20 shadow-sm px-10 bg-white">
                <h1 className="text-center text-6xl text-black/80 pt-10 pb-10 font-bold">Mini Quiz</h1>
                <div className="mb-12 flex justify-center" data-aos="fade-up" data-aos-delay="150">
                  {expiryTimestamp && (
                    <MyTimer
                      key={expiryTimestamp.getTime()}
                      expiryTimestamp={expiryTimestamp}
                      onExpire={HandleTimeExpired}
                      isRunning={isTimerRunning}
                    />
                  )}
                </div>

                <div className="flex justify-center items-start">
                  <div className="w-full max-w-5xl">
                    <div className="flex flex-col gap-5">
                      {visibleQuizzes.map((quiz, idx) => (
                        <div
                          key={`${quiz.id}-${currentIndex}`}
                          className="shadow-sm bg-white/60 p-4 rounded-lg border border-gray-100"
                          data-aos="fade-up-right"
                          data-aos-delay={idx * 150}
                        >
                          <h2 className="mb-3 font-normal">
                            {currentIndex + idx + 1}. {quiz.question}
                          </h2>

                          <RadioGroup
                            value={answers[quiz.id]}
                            onValueChange={(val) =>
                              setAnswers(prev => ({ ...prev, [quiz.id]: val }))
                            }
                          >
                            {quiz.choices.map((choice, i) => (
                              <div key={i} className="flex items-center gap-x-3 mb-1">
                                <RadioGroupItem value={choice} id={`${quiz.id}-${choice}`} />
                                <Label className="font-normal" htmlFor={`${quiz.id}-${choice}`}>
                                  {choice}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-5 mt-6">
                      <button
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 3))}
                        className="border w-full py-2 rounded bg-gray-200 text-black disabled:opacity-50"
                      >
                        Back
                      </button>

                      {currentIndex + 3 < getQuiz.length ? (
                        <button
                          onClick={HandleNextOrFinish}
                          disabled={isNextLoading}
                          aria-busy={isNextLoading}
                          className="border w-full py-2 rounded text-white bg-black disabled:opacity-80"
                        >
                          {isNextLoading ? "Loading..." : "Next"}
                        </button>
                      ) : (
                        <button
                          onClick={HandleNextOrFinish}
                          disabled={isNextLoading}
                          aria-busy={isNextLoading}
                          className="border w-full py-2 rounded text-white bg-black disabled:opacity-50"
                        >
                          {isNextLoading ? "Finishing..." : "Finish"}
                        </button>
                      )}
                    </div>

                    <p className="text-red-500 mt-3 text-center">{nextWarning}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
