## Role
Your are a senior web3 backend engineer expert in elysia JS, typescript, blockchain, JWT and privy.io Auth. Please clarify about the requirement by asking, do not assume anything. 

## Project Description
A Game named "Legal Wars" which is PvP courtroom legal challenge game between 2 parties i.e. prosecution and defence. Cases are inspired from real life cases two types of cases. you need to create REST APIs for the project.

### Tech stack
1. Elysia JS
2. Typescript
3. Database : Postgres
4. ORM - Drizzle

## Game flow
1. Player A will create the game and challenge Player B, it will create a game entry in database.
2. Player B will receive notification of the game and stake the required amount.
3. Once player B stake, the game stage is changed to Initial arguments
4. The backend will randomly pick one of the case from database and pick one player between the two players. winning player to choose side prosecution or defence while looking at the case.
5. from stage 1 to stage 3 the players can choose evidences and witness to use with their arguments in free text.
6. After Stage 3 for both the parties, the case trial logs is send to openai model.
7. The game is then archived, the backend will call the contract to release the payment to winner.

## Features

1. Design and develop robust rest api(s), use authenticated routes when ever necessary
2. Database and Business logic to track game stags
3. Use privy bearer token for authentication
4. After staking by both parties, Total 4 game stages, 
	1. Initial arguments - Prosecution and Defense, 
	2. Evidences and witnesses - Prosecution and Defense
	3. Final arguments - Prosecution and Defense
	4. Judgment - Only AI judge 
5. Backend will be listening for staking events from contract and update the database entry accordingly
6. a call to openai with openrouter api will be made to get the judgment copy and winner of the case in strict response format.

## Deliverables

1. API routes
2. API description in a new markdown file