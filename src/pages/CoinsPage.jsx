import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Coins, Gamepad2, Play, ShieldCheck, Sparkles, Star, Trophy, X, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "bcomkart_coins";

function getStoredCoins() {
  const saved = Number(localStorage.getItem(STORAGE_KEY) || "0");
  return Number.isFinite(saved) ? saved : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function MoleGame({ onReward, isFullScreen = false, onGameEnd, onStartGame, autoStart = false, onQuit }) {
  const boardBackgrounds = [
    { id: "meadow", label: "Meadow", value: "linear-gradient(180deg, #d8f5d6 0%, #a9d2a1 38%, #6fa26d 100%)" },
    { id: "sunset", label: "Sunset", value: "linear-gradient(180deg, #ffe4be 0%, #ffb48c 38%, #9e5d74 100%)" },
    { id: "midnight", label: "Midnight", value: "linear-gradient(180deg, #1d2c5e 0%, #0d1838 38%, #090d1d 100%)" },
    { id: "arcade", label: "Arcade", value: "linear-gradient(180deg, #d9ebff 0%, #7ec9ff 36%, #1d4f8d 100%)" },
  ];

  const moleAvatars = ["🐹", "🐰", "🦔"];
  const holeCount = 9;
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [activeHole, setActiveHole] = useState(null);
  const [activeAvatar, setActiveAvatar] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [health, setHealth] = useState(100);
  const [background, setBackground] = useState(boardBackgrounds[0]);
  const [pressedHole, setPressedHole] = useState(null);
  const [hitPulse, setHitPulse] = useState(null);
  const [hammerTick, setHammerTick] = useState(0);
  const rewardTriggered = useRef(false);
  const elapsed = 90 - timeLeft;
  const phaseBoost = Math.floor(elapsed / 15);
  const streakBoost = Math.floor(streak / 3);
  const spawnDelay = Math.max(700, 1500 - phaseBoost * 160 - streakBoost * 120);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = window.setInterval(() => {
      setActiveHole((current) => {
        const next = Math.floor(Math.random() * holeCount);
        return current === next ? (next + 1) % holeCount : next;
      });
    }, spawnDelay);

    return () => window.clearInterval(interval);
  }, [isPlaying, spawnDelay]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const countdown = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(countdown);
          setIsPlaying(false);
          setRoundOver(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [isPlaying]);

  useEffect(() => {
    if (health <= 0 && isPlaying) {
      setIsPlaying(false);
      setRoundOver(true);
      setActiveHole(null);
    }
  }, [health, isPlaying]);

  useEffect(() => {
    if (hitCount >= 12 && isPlaying) {
      setIsPlaying(false);
      setRoundOver(true);
      setActiveHole(null);
    }
  }, [hitCount, isPlaying]);

  useEffect(() => {
    if (!roundOver || rewardTriggered.current) return;
    const reward = Math.max(20, hitCount * 4);
    rewardTriggered.current = true;
    onReward(reward);
    onGameEnd?.(reward);
  }, [roundOver, hitCount, onReward, onGameEnd]);

  useEffect(() => {
    setActiveAvatar(Math.min(2, Math.floor(streak / 3)));
  }, [streak]);

  const resetRound = () => {
    rewardTriggered.current = false;
    setScore(0);
    setTimeLeft(90);
    setHitCount(0);
    setStreak(0);
    setHealth(100);
    setActiveHole(null);
    setActiveAvatar(0);
    setPressedHole(null);
    setHitPulse(null);
    setIsPlaying(false);
    setRoundOver(false);
  };

  const startRound = () => {
    rewardTriggered.current = false;
    setScore(0);
    setTimeLeft(90);
    setHitCount(0);
    setStreak(0);
    setHealth(100);
    setActiveHole(0);
    setActiveAvatar(0);
    setPressedHole(null);
    setHitPulse(null);
    setRoundOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (autoStart && !isPlaying && !roundOver) {
      startRound();
    }
  }, [autoStart, isPlaying, roundOver]);

  const applyHealthDelta = (delta) => {
    setHealth((current) => clamp(current + delta, 0, 100));
  };

  const handleWhack = (index) => {
    if (!isPlaying || activeHole !== index) return;

    setPressedHole(null);
    setHitPulse(index);
    setHammerTick((current) => current + 1);
    setScore((current) => current + 10);
    setHitCount((current) => current + 1);
    setStreak((current) => current + 1);
    applyHealthDelta(8);

    window.clearTimeout(window.__moleWhackTimeout);
    window.__moleWhackTimeout = window.setTimeout(() => {
      setPressedHole(null);
      setHitPulse(null);
      setActiveHole(null);

      window.clearTimeout(window.__moleRespawnTimeout);
      window.__moleRespawnTimeout = window.setTimeout(() => {
        setActiveHole((current) => {
          const next = Math.floor(Math.random() * holeCount);
          return current === next ? (next + 1) % holeCount : next;
        });
      }, 50);
    }, 1000);
  };

  const gameStatusText = roundOver
    ? (hitCount >= 12 ? "Round cleared!" : "Time up!")
    : isPlaying ? "Keep whacking!" : "Ready to start";

  return (
    <div className={`game-card ${isFullScreen ? "game-card-fullscreen" : ""}`}>
      {!isFullScreen && (
        <div className="game-card-header">
          <div>
            <p className="eyebrow">Whack a mole</p>
            <h3>Arcade reflex challenge</h3>
          </div>
          <HealthBar value={health} />
        </div>
      )}

      <div className={`game-toolbar ${isFullScreen ? "game-toolbar-full" : ""}`}>
        <div className="game-stats">
          <div className="game-stats-top">
            <span><TimerIcon /> {timeLeft}s</span>
            <span><Zap size={14} /> {Math.max(20, hitCount * 4)} coins</span>
          </div>
          <HealthBar value={health} compact />
        </div>
        {!isFullScreen && <div className="game-status">{gameStatusText}</div>}
      </div>

      {!isFullScreen && (
        <div className="background-picker" role="tablist" aria-label="Background theme picker">
          {boardBackgrounds.map((option) => (
            <button
              key={option.id}
              type="button"
              className={background.id === option.id ? "active" : ""}
              onClick={() => setBackground(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="whack-board-wrap" style={{ background: background.value }}>
        {roundOver && (
          <div className="board-finish-layer">
            <div className="board-finish-card">
              <p className="eyebrow">Game over</p>
              <h3>Earned: {Math.max(20, hitCount * 4)} coins</h3>
              <div className="board-finish-actions">
                <button type="button" className="primary-button" onClick={resetRound}>Try again</button>
                <button type="button" className="secondary-button" onClick={onQuit}>Quit</button>
              </div>
            </div>
          </div>
        )}

        {!roundOver && (
          <div className="whack-board">
            {Array.from({ length: holeCount }).map((_, index) => {
              const isVisible = activeHole === index;
              const isPressed = pressedHole === index;
              const isHit = hitPulse === index;

              return (
                <button
                  key={index}
                  type="button"
                  className={`mole-hole ${isVisible ? "active" : ""} ${isPressed ? "pressed" : ""} ${isHit ? "hit" : ""}`}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    if (!isPlaying) return;
                    if (!isVisible) {
                      setStreak(0);
                      applyHealthDelta(-18);
                      return;
                    }
                    setPressedHole(index);
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation();
                    if (isVisible && isPlaying && pressedHole === index) {
                      handleWhack(index);
                    }
                    setPressedHole(null);
                  }}
                  onPointerLeave={() => setPressedHole(null)}
                  aria-label={isVisible ? "Whack the mole" : "Mole hole"}
                >
                  <span className="hole-shadow" />
                  <span className={`mole-avatar ${isVisible || isHit ? "visible" : ""} ${isHit ? "hit" : ""}`} data-variant={activeAvatar}>
                    {moleAvatars[activeAvatar]}
                    {isHit && (
                      <>
                        <span key={hammerTick} className="hit-hammer" aria-hidden="true" />
                        <span className="damage-icon" aria-hidden="true">
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                        </span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="game-actions">
        {!isPlaying && !roundOver && (
          <button
            type="button"
            className="primary-button"
            onClick={(event) => {
              event.stopPropagation();
              if (onStartGame) {
                onStartGame();
                return;
              }
              startRound();
            }}
          >
            <Play size={15} /> Start round
          </button>
        )}
      </div>
    </div>
  );
}

function getHealthBarColor(value) {
  const safeValue = clamp(Number(value) || 0, 0, 100);

  if (safeValue <= 15) return "#ef4444";
  if (safeValue <= 25) return "#f97316";
  if (safeValue <= 50) return "#facc15";
  return "#22c55e";
}

function HealthBar({ value, compact = false }) {
  const safeValue = clamp(Number(value) || 0, 0, 100);
  const barColor = getHealthBarColor(safeValue);

  return (
    <div className={compact ? "health-pill" : "health-score"} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
      <span className={compact ? "health-pill-label" : "health-score-label"}>❤️</span>
      <span className={compact ? "health-pill-bar" : "health-bar"}>
        <span style={{ width: `${safeValue}%`, background: `linear-gradient(90deg, ${barColor} 0%, ${barColor} 100%)` }} />
      </span>
    </div>
  );
}

function TimerIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /></svg>;
}

function DodgeGame({ onReward, isFullScreen = false, onGameEnd, onStartGame, autoStart = false, onQuit }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [playerX, setPlayerX] = useState(50);
  const [fallingItems, setFallingItems] = useState([]);
  const [roundOver, setRoundOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [minutesSurvived, setMinutesSurvived] = useState(0);
  const rewardTriggered = useRef(false);
  const playerXRef = useRef(50);
  const boardRef = useRef(null);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const keyHandler = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        setPlayerX((current) => clamp(current - 12, 10, 90));
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        setPlayerX((current) => clamp(current + 12, 10, 90));
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const minuteMarker = window.setInterval(() => {
      setMinutesSurvived((current) => current + 1);
    }, 30000);

    return () => window.clearInterval(minuteMarker);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const spawnIntervalMs = Math.max(500, 1200 - minutesSurvived * 110);

    const spawnInterval = window.setInterval(() => {
      const spawnType = Math.random() < 0.7 ? "good" : "bad";
      const goodItems = ["⭐", "💎", "🎯", "🎁", "🪙"];
      const badItems = ["💣", "☠️", "🧨", "🔥", "⚠️"];
      const emoji = spawnType === "good" ? goodItems[Math.floor(Math.random() * goodItems.length)] : badItems[Math.floor(Math.random() * badItems.length)];

      setFallingItems((current) => [
        ...current,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 82 + 9,
          y: -12,
          speed: 0.9 + Math.random() * 1.3 + minutesSurvived * 0.12,
          type: spawnType,
          emoji,
        },
      ]);
    }, spawnIntervalMs);

    return () => window.clearInterval(spawnInterval);
  }, [isPlaying, minutesSurvived]);

  const applyDodgeHealthDelta = (delta) => {
    setHealth((current) => {
      const next = clamp(current + delta, 0, 100);
      if (next <= 0 && isPlaying) {
        setIsPlaying(false);
        setRoundOver(true);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isPlaying) return undefined;

    const tickInterval = window.setInterval(() => {
      setFallingItems((current) => {
        const next = current.map((item) => ({ ...item, y: item.y + item.speed }));

        const surviving = [];
        let caughtGood = 0;
        let collidedBad = 0;

        next.forEach((item) => {
          const playerLeft = playerXRef.current - 8;
          const playerRight = playerXRef.current + 8;
          const isHitPlayer = item.y >= 76 && item.y <= 92 && item.x >= playerLeft && item.x <= playerRight;

          if (isHitPlayer) {
            if (item.type === "good") {
              caughtGood += 1;
              return;
            }
            collidedBad += 1;
            return;
          }

          if (item.y < 110) {
            surviving.push(item);
          }
        });

        if (caughtGood > 0) {
          setScore((currentScore) => currentScore + caughtGood * 10);
          applyDodgeHealthDelta(caughtGood * 7);
        }

        if (collidedBad > 0) {
          applyDodgeHealthDelta(-30 * collidedBad);
        }

        return surviving;
      });
    }, 70);

    return () => window.clearInterval(tickInterval);
  }, [isPlaying]);

  useEffect(() => {
    if (health <= 0 && isPlaying) {
      setIsPlaying(false);
      setRoundOver(true);
    }
  }, [health, isPlaying]);

  useEffect(() => {
    if (!roundOver || rewardTriggered.current) return;
    const reward = Math.max(15, Math.floor(score / 18));
    rewardTriggered.current = true;
    onReward(reward);
    onGameEnd?.(reward);
  }, [roundOver, score, onReward, onGameEnd]);

  const movePlayerToPointer = (clientX) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPlayerX(clamp(percent, 10, 90));
  };

  const handleBoardPointerDown = (event) => {
    if (!isPlaying) return;
    setIsDragging(true);
    boardRef.current?.setPointerCapture?.(event.pointerId);
    movePlayerToPointer(event.clientX);
  };

  const handleBoardPointerMove = (event) => {
    if (!isDragging || !isPlaying) return;
    movePlayerToPointer(event.clientX);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const resetRound = () => {
    rewardTriggered.current = false;
    setPlayerX(50);
    setFallingItems([]);
    setScore(0);
    setHealth(100);
    setMinutesSurvived(0);
    setRoundOver(false);
    setIsPlaying(false);
    setIsDragging(false);
  };

  const startRound = () => {
    rewardTriggered.current = false;
    setPlayerX(50);
    setFallingItems([]);
    setScore(0);
    setHealth(100);
    setMinutesSurvived(0);
    setRoundOver(false);
    setIsPlaying(true);
    setIsDragging(false);
  };

  useEffect(() => {
    if (autoStart && !isPlaying && !roundOver) {
      startRound();
    }
  }, [autoStart, isPlaying, roundOver]);

  return (
    <div className={`game-card ${isFullScreen ? "game-card-fullscreen" : ""}`}>
      {!isFullScreen && (
        <div className="game-card-header">
          <div>
            <p className="eyebrow">Dodge game</p>
            <h3>Catch the good ones</h3>
          </div>
          <HealthBar value={health} />
        </div>
      )}

      {!isFullScreen && (
        <p className="game-copy">Move left and right with A/D or arrow keys. Catch the glowing rewards, and avoid the danger drops before time runs out.</p>
      )}
      <div className={`game-toolbar ${isFullScreen ? "game-toolbar-full" : ""}`}>
        <div className="game-stats">
          <div className="game-stats-top">
            <span><Zap size={14} /> +{Math.max(15, Math.floor(score / 18))} coins</span>
          </div>
          <HealthBar value={health} compact />
        </div>
      </div>
      <div
        ref={boardRef}
        className="dodging-board"
        onPointerDown={(event) => {
          event.stopPropagation();
          handleBoardPointerDown(event);
        }}
        onPointerMove={(event) => {
          event.stopPropagation();
          handleBoardPointerMove(event);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          stopDragging();
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          stopDragging();
        }}
        onPointerCancel={(event) => {
          event.stopPropagation();
          stopDragging();
        }}
      >
        {roundOver && (
          <div className="board-finish-layer">
            <div className="board-finish-card">
              <p className="eyebrow">Game over</p>
              <h3>Earned: {Math.max(15, Math.floor(score / 18))} coins</h3>
              <div className="board-finish-actions">
                <button type="button" className="primary-button" onClick={resetRound}>Try again</button>
                <button type="button" className="secondary-button" onClick={onQuit}>Quit</button>
              </div>
            </div>
          </div>
        )}

        {!roundOver && (
          <>
            <div className="dodging-player" style={{ left: `${playerX}%` }}>
              <span className="player-avatar">🧑‍🚀</span>
            </div>

            {fallingItems.map((item) => (
              <div
                key={item.id}
                className={`dodging-item ${item.type === "good" ? "good" : "bad"}`}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                aria-label={item.type === "good" ? "Good item" : "Bad item"}
              >
                <span className="dodging-item-emoji">{item.emoji}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="game-actions">
        {!isPlaying && !roundOver && (
          <button
            type="button"
            className="primary-button"
            onClick={(event) => {
              event.stopPropagation();
              if (onStartGame) {
                onStartGame();
                return;
              }
              startRound();
            }}
          >
            <Play size={15} /> Start run
          </button>
        )}
      </div>
    </div>
  );
}

export function CoinsPage() {
  const { user } = useAuth();
  const [coins, setCoins] = useState(() => getStoredCoins());
  const [fullscreenGame, setFullscreenGame] = useState(null);
  const [autoStartGame, setAutoStartGame] = useState(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  useEffect(() => {
    const accountBalance = Number(user?.bcomCoins || 0);
    if (accountBalance > 0) {
      setCoins(accountBalance);
      localStorage.setItem(STORAGE_KEY, String(accountBalance));
    }
  }, [user]);

  const awardCoins = (amount) => {
    setCoins((current) => {
      const next = current + amount;
      localStorage.setItem(STORAGE_KEY, String(next));

      if (user) {
        const currentUser = JSON.parse(localStorage.getItem("bcomkart_user") || "null");
        if (currentUser) {
          currentUser.bcomCoins = next;
          localStorage.setItem("bcomkart_user", JSON.stringify(currentUser));
        }
      }

      return next;
    });
  };

  const rewardSummary = useMemo(() => [
    { title: "Best streak", value: "Up to 25 coins" },
    { title: "Game time", value: "20 sec rounds" },
    { title: "Reward style", value: "Instant wallet credit" },
  ], []);

  const openGame = (game, shouldAutoStart = false) => {
    setFullscreenGame(game);
    setAutoStartGame(shouldAutoStart ? game : null);
  };

  const requestCloseGame = () => {
    setShowQuitConfirm(true);
  };

  const closeGame = () => {
    setShowQuitConfirm(false);
    setFullscreenGame(null);
    setAutoStartGame(null);
  };

  const resumeGame = () => {
    setShowQuitConfirm(false);
  };

  if (fullscreenGame) {
    return (
      <div className="coins-fullscreen-overlay">
        <div className="fullscreen-game-wrap">
          <button type="button" className="game-close-button" aria-label="Close game" onClick={requestCloseGame}>
            <X size={18} />
          </button>
          {showQuitConfirm && (
            <div className="quit-confirm-overlay">
              <div className="quit-confirm-card">
                <p className="eyebrow">Quit game</p>
                <h3>Are you sure you want to quit?</h3>
                <div className="quit-confirm-actions">
                  <button type="button" className="secondary-button" onClick={resumeGame}>Resume</button>
                  <button type="button" className="primary-button" onClick={closeGame}>Quit</button>
                </div>
              </div>
            </div>
          )}
          {fullscreenGame === "mole" ? (
            <MoleGame onReward={awardCoins} isFullScreen onGameEnd={() => {}} autoStart={autoStartGame === "mole"} onQuit={closeGame} />
          ) : (
            <DodgeGame onReward={awardCoins} isFullScreen onGameEnd={() => {}} autoStart={autoStartGame === "dodge"} onQuit={closeGame} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="coins-page">
      <div className="page-heading">
        <p className="eyebrow"><Coins size={14} /> BcomCoins</p>
        <h1>Earn coins and keep playing</h1>
        <p>Use your rewards at checkout and unlock extra value with every game session.</p>
      </div>

      <section className="coins-overview">
        <div className="coin-balance-card">
          <div className="coin-balance-row">
            <span className="coin-badge"><Coins size={22} /></span>
            <div>
              <p className="eyebrow">Your balance</p>
              <h2>{coins}</h2>
            </div>
          </div>
          <p>1 BcomCoin = ₹1 off your next order.</p>
          <Link to="/profile" className="secondary-button">View profile</Link>
        </div>

        <div className="coins-info-card">
          <div className="coin-info-header">
            <Sparkles size={18} />
            <strong>How to earn</strong>
          </div>
          <ul>
            {rewardSummary.map((item) => (
              <li key={item.title}><span>{item.title}</span><strong>{item.value}</strong></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="earn-section">
        <div className="section-header">
          <div>
            <p className="eyebrow"><Gamepad2 size={14} /> Play & earn</p>
            <h2>Mini-games</h2>
          </div>
          <Trophy size={20} className="trophy-icon" />
        </div>

        <div className="game-grid">
          <div className="game-card-clickable">
            <MoleGame onReward={awardCoins} onStartGame={() => openGame("mole", true)} />
          </div>
          <div className="game-card-clickable">
            <DodgeGame onReward={awardCoins} onStartGame={() => openGame("dodge", true)} />
          </div>
        </div>
      </section>

      <section className="reward-rules-card">
        <div className="rules-header">
          <ShieldCheck size={18} />
          <h3>Reward rules</h3>
        </div>
        <div className="rules-list">
          <div>
            <Star size={16} />
            <p>Coins are added instantly after each game round is completed.</p>
          </div>
          <div>
            <Zap size={16} />
            <p>Fast rounds, higher scores, and survival time help you earn more coins.</p>
          </div>
          <div>
            <Coins size={16} />
            <p>Use your wallet balance during checkout for automatic discounts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
