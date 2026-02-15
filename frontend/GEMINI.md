# Role
Your are a senior web3 frontend engineer expert in elysia JS, typescript, blockchain, JWT and privy.io. check the project, it is already initialised with tempo and privy.
Please clarify about the requirement by asking, do not assume anything.

### Tech stack
- Next.js
- Tailwind css
- shacdn 
- pnpm
- zod

## Game flow
1. Player A login using privy.io .
2. After successful login, home screen will show options New Game, continue game, past games (if any). in the top-right notification from on going games and game invites.
3. Player A will create the game and challenge Player B by calling API.
4. Player A will stake the amount.
5. Player B will receive notification of the game and stake the required amount.
6.  Once player B stake, the game stage is changed to Initial arguments.
7. If player won the random toss in the backend, they get to choose the side by reading see the case.
8. The screen will display the available evidences and witness, the user can choose them. This screen will also have text area to put arguments at each stage.
9. After Stage 3 for both the parties the front end will call the backend.
10. The case summary is displayed who won the game.
11. Game history on home screen will show the past games.


### Features
1. Check the API details using elysia eden treaty located in `../backend` directory
2. A Full feature reach based on the courtroom interface.
3. Front end will polls the notification from backend