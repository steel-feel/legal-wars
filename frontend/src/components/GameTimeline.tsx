"use client";

import { STAGE_ORDER, STAGE_LABELS, type GameStageType } from "@/lib/types";

interface GameTimelineProps {
    currentStage: GameStageType;
}

export function GameTimeline({ currentStage }: GameTimelineProps) {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max px-1 py-2">
                {STAGE_ORDER.map((stage, i) => {
                    const isActive = i === currentIndex;
                    const isCompleted = i < currentIndex;

                    return (
                        <div key={stage} className="flex items-center">
                            {i > 0 && (
                                <div
                                    className="w-6 h-0.5 mx-0.5"
                                    style={{
                                        background: isCompleted
                                            ? "var(--accent-success-solid)"
                                            : "rgba(255,255,255,0.1)",
                                    }}
                                />
                            )}
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${isActive ? "ring-2 ring-offset-1 ring-offset-black" : ""
                                        }`}
                                    style={{
                                        background: isCompleted
                                            ? "var(--accent-success-solid)"
                                            : isActive
                                                ? "var(--accent-primary-solid)"
                                                : "rgba(255,255,255,0.08)",
                                        color: isCompleted || isActive ? "#fff" : "var(--text-tertiary)",
                                    }}
                                >
                                    {isCompleted ? "✓" : i + 1}
                                </div>
                                <span
                                    className="text-[9px] whitespace-nowrap"
                                    style={{
                                        color: isActive
                                            ? "var(--text-primary)"
                                            : isCompleted
                                                ? "var(--accent-success-solid)"
                                                : "var(--text-tertiary)",
                                    }}
                                >
                                    {STAGE_LABELS[stage]}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
