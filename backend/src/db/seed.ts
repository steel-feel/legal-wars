import { db } from "./db";
import { cases } from "./schema";

const seedCases = [
    {
        title: "TechCorp vs. InnovateLabs — Trade Secret Theft",
        description:
            "TechCorp alleges that former employee Sarah Chen stole proprietary AI algorithms when she left to join InnovateLabs. Internal logs show she accessed restricted files 48 hours before resignation. InnovateLabs launched a suspiciously similar product 3 months later.",
        prosecutionBrief:
            "TechCorp invested $12M in R&D for their neural network optimization algorithm. Digital forensics show Sarah Chen downloaded 2.3GB of proprietary data to a personal USB drive. InnovateLabs' product 'NeuralBoost' shares 87% code similarity with TechCorp's unreleased technology.",
        defenseBrief:
            "Sarah Chen is a talented engineer who independently developed similar technology. The AI optimization field has well-known approaches. Her non-compete clause expired, and she had every right to use her general expertise. Code similarity is coincidental given the shared problem domain.",
        evidences: [
            "USB access logs showing 2.3GB transfer",
            "Code similarity analysis report (87% match)",
            "Sarah Chen's employment contract with non-compete clause",
            "InnovateLabs product launch timeline",
            "TechCorp R&D investment records ($12M)",
            "Sarah's personal GitHub showing parallel research",
            "Email correspondence between Sarah and InnovateLabs CEO prior to resignation",
        ],
        witnesses: [
            "Dr. James Liu — TechCorp CTO who supervised Sarah",
            "Maria Gonzalez — Digital forensics expert",
            "Sarah Chen — Former TechCorp employee (defendant)",
            "Robert Park — InnovateLabs CEO",
            "Dr. Amanda Foster — Independent AI researcher",
        ],
    },
    {
        title: "State vs. Marcus Webb — Financial Fraud",
        description:
            "Marcus Webb, CEO of GreenFuture Energy, is accused of orchestrating a $50M Ponzi scheme disguised as a green energy investment fund. Over 200 investors lost their savings. Webb claims the business model was legitimate but failed due to market conditions.",
        prosecutionBrief:
            "Marcus Webb promised investors 25% annual returns on a green energy fund. Investigation reveals no actual energy projects were funded. New investor money was used to pay earlier investors. Webb diverted $8M to personal accounts including a yacht and Villa in Monaco.",
        defenseBrief:
            "GreenFuture Energy was a legitimate business that invested in solar and wind projects across 3 countries. Market downturn and supply chain disruptions caused project failures. Webb's personal expenses were legitimate salary and bonuses approved by the board.",
        evidences: [
            "Bank records showing circular fund transfers",
            "GreenFuture investor prospectus promising 25% returns",
            "Yacht purchase receipt under shell company name",
            "Monaco villa deed in Webb's wife's name",
            "Three solar farm project contracts (partially completed)",
            "Board meeting minutes approving CEO compensation",
            "SEC whistleblower complaint from former CFO",
            "Independent audit showing $42M unaccounted for",
        ],
        witnesses: [
            "Linda Torres — Former CFO and whistleblower",
            "Frank Morrison — Lead SEC investigator",
            "Marcus Webb — Defendant CEO",
            "Dr. Helen Park — Forensic accountant",
            "James Carter — Investor who lost $2M",
            "Anna Schmidt — GreenFuture board member",
        ],
    },
    {
        title: "Rivera vs. Metro Daily News — Defamation",
        description:
            "City Councilwoman Elena Rivera sues Metro Daily News for publishing an article alleging she accepted $500K in bribes from a real estate developer. Rivera claims the story was fabricated and destroyed her political career and reputation.",
        prosecutionBrief:
            "Metro Daily News published an article titled 'Councilwoman Rivera's Secret Deal' based on a single anonymous source. The article contained fabricated claims about cash payments. Rivera lost her re-election bid by 2% after leading by 15% in polls before the article. She suffered severe emotional distress and lost $300K in future earnings.",
        defenseBrief:
            "The article was based on credible investigative journalism. The anonymous source provided bank statements and meeting logs. Rivera's voting record shows suspicious pattern of favoring the developer's projects. Freedom of the press protects reporting on matters of public interest.",
        evidences: [
            "Published article 'Councilwoman Rivera's Secret Deal'",
            "Pre-article poll showing Rivera leading by 15%",
            "Election results showing 2% loss",
            "Anonymous source's bank statement copies",
            "Rivera's voting record on zoning decisions",
            "Developer's campaign contribution records (legal)",
            "Rivera's financial disclosure forms",
            "Text messages between journalist and anonymous source",
        ],
        witnesses: [
            "Elena Rivera — Plaintiff councilwoman",
            "Tom Hargrove — Metro Daily News journalist",
            "David Kline — Metro Daily News editor-in-chief",
            "Dr. Patricia Yang — Political reputation expert",
            "Detective Mike O'Brien — Financial crimes investigator",
        ],
    },
    {
        title: "Johnson vs. MegaCorp Industries — Wrongful Termination",
        description:
            "Senior engineer David Johnson was fired from MegaCorp Industries 2 weeks after filing an internal safety report about defective brake components being shipped to automakers. MegaCorp claims the termination was due to poor performance.",
        prosecutionBrief:
            "David Johnson discovered that batch #4471 brake calipers had a 12% failure rate in stress testing, far exceeding the 0.1% industry standard. He filed an internal safety report and was terminated 14 days later. His performance reviews for the past 5 years were all 'exceeds expectations'. MegaCorp continued shipping the defective parts.",
        defenseBrief:
            "Johnson was terminated as part of a planned departmental restructuring that affected 23 employees. His position was eliminated, not his employment terminated for cause. The safety concerns were addressed through the standard internal review process. The brake caliper batch was retested and met specifications.",
        evidences: [
            "Johnson's internal safety report on batch #4471",
            "Stress test data showing 12% failure rate",
            "Termination letter citing 'restructuring'",
            "5 years of performance reviews ('exceeds expectations')",
            "Restructuring plan document (created 3 days before termination)",
            "Shipping records showing batch #4471 continued distribution",
            "Internal email chain about 'handling the Johnson situation'",
            "List of 23 'restructured' employees with hire dates",
        ],
        witnesses: [
            "David Johnson — Plaintiff engineer",
            "Karen Mitchell — MegaCorp HR Director",
            "Dr. Robert Tanaka — Independent materials engineer",
            "Lisa Pham — Johnson's direct supervisor",
            "Mark Davies — Fellow engineer who corroborates safety findings",
            "Thomas Wright — MegaCorp VP of Operations",
        ],
    },
    {
        title: "State vs. The Silk Road Collective — Drug Trafficking via Cryptocurrency",
        description:
            "Five individuals known as 'The Silk Road Collective' are accused of operating an online marketplace facilitating $120M in illegal drug sales using cryptocurrency for anonymous transactions. The defendants claim they only provided a technology platform.",
        prosecutionBrief:
            "The Collective operated 'DarkMarket' on the dark web for 3 years, facilitating sales of narcotics, synthetic drugs, and prescription medications. Blockchain analysis traces $120M in transactions. The operators took a 5% commission on each sale. Undercover agents successfully purchased drugs through the platform on 15 occasions.",
        defenseBrief:
            "The defendants created a general-purpose marketplace platform. Like any technology company, they cannot control how users utilize the platform. Their terms of service explicitly prohibited illegal goods. They cooperated with law enforcement when notified of illegal activity and removed flagged listings.",
        evidences: [
            "Blockchain analysis tracing $120M in transactions",
            "Undercover purchase records (15 transactions)",
            "DarkMarket server logs retrieved by FBI",
            "Commission wallet showing $6M in 5% fees",
            "Terms of service prohibiting illegal goods",
            "Chat logs between operators discussing 'product quality'",
            "Records of 47 reported listings removed",
            "Encrypted communications between ring members",
        ],
        witnesses: [
            "Agent Sarah Collins — FBI Cybercrime Division",
            "Dr. Nathan Cruz — Blockchain forensics expert",
            "Alex Kim — Lead defendant / platform developer",
            "Dr. Michelle Tran — Drug enforcement specialist",
            "Ryan Peters — Cooperating co-defendant",
            "Professor Laura Chen — Internet law expert",
        ],
    },
];

async function seed() {
    console.log("🌱 Seeding cases...");

    for (const c of seedCases) {
        await db.insert(cases).values(c).onConflictDoNothing();
    }

    console.log(`✅ Seeded ${seedCases.length} cases successfully!`);
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
