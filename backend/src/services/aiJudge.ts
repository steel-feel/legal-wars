import type { Game, GameStage, Case, Player } from "../db/schema";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface GameWithRelations {
    id: string;
    case: Case;
    prosecutionPlayerId: string | null;
    defensePlayerId: string | null;
    creator: Player;
    opponent: Player;
    stages: (GameStage & { player: Player })[];
}

interface JudgmentResult {
    winner: "prosecution" | "defense";
    judgment: string;
    reasoning: string;
}

/**
 * Build a structured trial transcript from all game stages
 */
function buildTrialTranscript(game: GameWithRelations): string {
    const caseInfo = game.case;
    const stages = game.stages;

    const getStageSubmissions = (stageName: string) => {
        return stages.filter((s) => s.stage === stageName);
    };

    const prosecutionPlayer =
        game.prosecutionPlayerId === game.creator.id
            ? game.creator
            : game.opponent;
    const defensePlayer =
        game.defensePlayerId === game.creator.id ? game.creator : game.opponent;

    let transcript = `
## CASE: ${caseInfo.title}

### Case Description
${caseInfo.description}

### Prosecution Brief
${caseInfo.prosecutionBrief}

### Defense Brief
${caseInfo.defenseBrief}

---

## TRIAL PROCEEDINGS

### Prosecution Attorney: ${prosecutionPlayer.walletAddress}
### Defense Attorney: ${defensePlayer.walletAddress}

---

### STAGE 1: Initial Arguments
`;

    const initialArgs = getStageSubmissions("initial_arguments");
    for (const sub of initialArgs) {
        const role = sub.side === "prosecution" ? "PROSECUTION" : "DEFENSE";
        transcript += `\n**${role}:**\n${sub.argumentText}\n`;
    }

    transcript += `\n---\n\n### STAGE 2: Evidence & Witnesses\n`;
    const evidenceStage = getStageSubmissions("evidences_witnesses");
    for (const sub of evidenceStage) {
        const role = sub.side === "prosecution" ? "PROSECUTION" : "DEFENSE";
        transcript += `\n**${role}:**\n${sub.argumentText}\n`;
        if (sub.selectedEvidences && sub.selectedEvidences.length > 0) {
            transcript += `\nEvidence Presented:\n${sub.selectedEvidences.map((e) => `- ${e}`).join("\n")}\n`;
        }
        if (sub.selectedWitnesses && sub.selectedWitnesses.length > 0) {
            transcript += `\nWitnesses Called:\n${sub.selectedWitnesses.map((w) => `- ${w}`).join("\n")}\n`;
        }
    }

    transcript += `\n---\n\n### STAGE 3: Final Arguments\n`;
    const finalArgs = getStageSubmissions("final_arguments");
    for (const sub of finalArgs) {
        const role = sub.side === "prosecution" ? "PROSECUTION" : "DEFENSE";
        transcript += `\n**${role}:**\n${sub.argumentText}\n`;
    }

    return transcript;
}

/**
 * Call OpenRouter AI to get judgment
 */
export async function triggerJudgment(
    game: GameWithRelations
): Promise<JudgmentResult> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not set");
    }

    const transcript = buildTrialTranscript(game);

    const systemPrompt = `You are an impartial AI judge presiding over a courtroom trial in the game "Legal Wars". 
You must analyze the trial transcript carefully, considering:
1. The strength and relevance of arguments presented by each side
2. The quality and persuasiveness of evidence presented
3. The credibility and relevance of witnesses called
4. Legal reasoning and logical consistency
5. How well each side addressed the opposing arguments

You must deliver a fair and well-reasoned judgment.

IMPORTANT: You must respond in STRICT JSON format with exactly these fields:
{
  "winner": "prosecution" or "defense",
  "judgment": "A formal judgment copy (2-3 paragraphs) written as if read aloud in court",
  "reasoning": "A brief explanation of the key factors that influenced the decision"
}

Do NOT include any text outside the JSON object.`;

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://legalwars.game",
            "X-Title": "Legal Wars",
        },
        body: JSON.stringify({
            model: "arcee-ai/trinity-mini:free",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Please review the following trial transcript and deliver your judgment:\n\n${transcript}`,
                },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("No response content from AI judge");
    }

    try {
        const result = JSON.parse(content) as JudgmentResult;

        if (!["prosecution", "defense"].includes(result.winner)) {
            throw new Error(`Invalid winner value: ${result.winner}`);
        }

        if (!result.judgment || !result.reasoning) {
            throw new Error("Missing judgment or reasoning in AI response");
        }

        return result;
    } catch (parseError) {
        throw new Error(`Failed to parse AI judgment: ${content}`);
    }
}
