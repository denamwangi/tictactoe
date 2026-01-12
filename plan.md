📦 STEP 2.1: PUSHER ACCOUNT & PROJECT SETUP
Manual Setup (You Do This First)

Create Pusher Account

Sign up at pusher.com
Create new Channels app (not Beams)
Name it "tic-tac-toe"
Choose cluster closest to your users

Configure App Settings

Enable "Client Events" in dashboard (critical for player-to-player messaging)
Copy your credentials (app_id, key, secret, cluster)

Environment Setup

Install pusher and pusher-js packages
Create environment variables file
Store Pusher credentials securely
Add public keys for client-side access

🔧 STEP 2.2: PUSHER INTEGRATION LAYER
What to Build:
Server-Side Pusher Instance

Configuration file for server operations
Uses private credentials
For triggering events from backend (if needed later)

Client-Side Pusher Instance

Configuration file for browser operations
Uses public credentials only
Connects users to real-time channels

React Hook for Channel Management

Subscribe to channels when entering rooms
Unsubscribe when leaving
Handle connection lifecycle automatically
Return channel object for event binding

🏠 STEP 2.3: ROOM SYSTEM & ROUTING
What to Build:
Room Utilities

Function to generate unique room IDs (short, shareable codes)
Function to construct channel names from room IDs
Function to create shareable room URLs
Helper for getting current room from URL

Type System Updates

Add PlayerRole type (which player you are: X or O)
Add RoomStatus type (waiting, ready, playing, finished)
Extend GameState to include multiplayer context
Add player count tracking
Add opponent connection status

Routing Structure

Dynamic route for game rooms: /game/[roomId]
Extract room ID from URL parameters
Validate room ID format
Handle invalid room IDs gracefully

Lobby Page

Transform home page into game launcher
"Create New Game" - generates room and navigates
"Join Game" - input for room code + validation
Remove old single-player game from home

🎮 STEP 2.4: MULTIPLAYER GAME STATE MANAGEMENT
What to Build:
Enhanced Game State Hook
This is your core multiplayer brain that handles:
State Management:

All original game state (board, current player, winner, etc.)
Which player you are (X or O)
Room status tracking
Player count (how many in room)
Opponent connection status

Pusher Event Handling:

Listen for player joining events
Listen for move events from opponent
Listen for game reset events
Track connection/disconnection events
Handle initial room subscription

Game Logic:

Validate it's your turn before allowing moves
Update local state immediately
Broadcast your moves to opponent
Apply opponent's moves when received
Check win/draw conditions after each move
Assign player roles when joining (first = X, second = O)
Switch turns after valid moves

Room Management:

Join room function (announces presence)
Leave room function (cleanup)
Reset game function (syncs with opponent)
Handle room capacity (max 2 players)

Turn Enforcement:

Block moves when not your turn
Validate moves client-side
Prevent cheating through role verification

🎨 STEP 2.5: MULTIPLAYER UI COMPONENTS
What to Build:
Waiting Room Component

Display while waiting for second player
Show room code prominently
Copy room link button
Loading animation
Instructions for sharing

Enhanced Game Status Component

Show waiting state
Show whose turn it is (you vs opponent)
Indicate which player you are (X or O)
Show win/loss/draw with your perspective
Reset button (when appropriate)
Visual turn indicator

Enhanced Board Component

Disable interaction when not your turn
Visual feedback for whose turn
Show cursor states (allowed vs not allowed)
Keep all existing cell rendering
Highlight on hover only when your turn

Room Info Component

Display room code
Show your player assignment (X or O)
Opponent connection status
Copy link button
Leave game button
Compact design for top of screen

🔗 STEP 2.6: WIRE UP GAME ROOM PAGE
What to Build:
Complete Game Room Page
Orchestrates all multiplayer components:
Page Flow:

Extract room ID from URL
Initialize multiplayer game hook
Auto-join room on mount
Show waiting room until opponent arrives
Switch to game board when both players ready
Display all relevant components in correct layout

Component Integration:

Room info at top
Game status below
Board in center
Pass correct props to all components
Handle all user actions (moves, reset, leave)

State Display:

Loading state while connecting
Waiting state (one player)
Playing state (two players)
Finished state (game over)

🛡️ STEP 2.7: EDGE CASE HANDLING
What to Build:
Disconnection Handling

Detect when opponent disconnects
Show overlay or message
Option to wait or leave
Resume game if opponent reconnects
Handle page refresh scenarios

Room Capacity Management

Prevent third player from joining
Show "room full" message
Provide navigation back to lobby
Check player count before role assignment

Disconnected Overlay Component

Modal that appears over game
Show disconnect message
Offer "wait" or "leave" options
Semi-transparent backdrop
Clear call-to-action buttons

Session Recovery

Try to restore player role on refresh
Use browser storage for session persistence
Handle cases where role is lost
Graceful degradation if restore fails

✨ STEP 2.8: UX POLISH
What to Add:
Toast Notifications

Install toast library
"Opponent joined!" message
"Opponent left" message
"Link copied!" confirmation
"Invalid move" feedback
Position and timing configuration

Animations & Transitions

Fade in opponent's moves
Pulse effect on your turn
Smooth state transitions
Loading spinners
Cell click animations
Component enter/exit animations

Move History (Optional)

Scrollable log of all moves
Show who moved where
Timestamp each move
Helps players review game
Collapsible sidebar or panel

🧪 STEP 2.9: TESTING & DEBUGGING
What to Add:
Debugging Infrastructure

Console logging for events
Event data inspection
State change tracking
Connection status logging
Error boundaries

Error Handling

Try-catch around Pusher operations
Graceful fallbacks
User-friendly error messages
Automatic retry logic
Connection quality indicators

Testing Scenarios to Verify:
Happy Path Tests:

Create and join room flow
Player assignment (X and O)
Real-time move synchronization
Win detection across clients
Draw detection across clients
Reset synchronization

Edge Case Tests:

Third player attempts to join
Mid-game page refresh
Player disconnection
Simultaneous move attempts
Out-of-turn move attempts
Network interruption recovery

Cross-Browser/Device Tests:

Different browsers simultaneously
Mobile and desktop mix
Different network speeds
Incognito mode testing

## PHASE 3 - NEW PHASE. RANDOM OPPONENT.

High-Level Feature & System Design Plan (No Code)

1. Core Conceptual Model
   One Game, Two Entry Paths

Both flows ultimately converge into:

A game room

With two players

Using shared Pusher logic

Running the same game engine

The only difference is how the room gets created.

2. UI / Component Plan
   A. Welcome Screen (New Entry Point)

Purpose: Mode selection

Elements:

CTA 1: Play with Friend

CTA 2: Play Random Opponent

Responsibilities:

Capture user intent

Set initial user mode

Route user into the correct pre-game flow

B. Friend Play Flow (Existing, Slightly Refactored)

Flow:

User selects Play with Friend

App generates or reuses invite link

Friend joins via link

Room already exists or is created on join

Game starts

Notes:

This flow becomes a specialized room-creation path

No waiting room

Deterministic pairing

C. Random Play Flow (New)
Waiting Room Component

Purpose: Hold users until matched

UI State:

“Awaiting opponent…”

No game interaction yet

Passive, listening state

Exit Conditions:

Matched with another user

Game room assigned

Game start signal received

3. User State Model (Conceptual)

Each connected user maintains:

Mode

friend

random

Status

browsing / welcome

waiting

matched

in_game

disconnected

Room Association

none

pending

active room ID

This state exists outside the UI, so refreshes or reconnects don’t break logic.

4. Matchmaking Logic (Random Play)
   Waiting Pool

Maintain a shared pool of users who:

Selected random

Are in waiting status

Are currently connected

Matching Rules

When a user enters the waiting pool:

If another waiting user exists:

Pair immediately

Else:

Remain waiting

Role Assignment

First user → Player 1

Second user → Player 2

Match Creation Steps (Conceptual)

Remove both users from waiting pool

Create a new game room

Assign player roles

Update both users’ status to matched

Notify both users via Pusher

Transition both clients into the game room

Start game

5. Shared Game Room Logic (Critical)

Once a room exists, everything is identical regardless of entry path:

Same room structure

Same player roles

Same Pusher channels

Same game events

Same win/loss handling

This is the key architectural constraint:
No game logic should care how players were matched.

6. Real-Time / Pusher Strategy
   Shared Infrastructure

One set of Pusher channels per room

Same event names across both flows

Same client listeners

Event Categories

Presence / connection

Match found

Room joined

Game start

Game updates

Disconnect / cleanup

Why This Matters

Cursor can implement everything once

Fewer bugs

Easier future modes (ranked, tournament, etc.)

7. Cleanup & Edge Cases (High-Level)
   Disconnects

If a waiting user disconnects → remove from pool

If a matched user disconnects before game start → dissolve match

Refresh / Rejoin

User state determines whether they:

Return to waiting room

Rejoin game room

Restart at welcome screen

8. Mental Model for Cursor (Important)

You can summarize the entire system to Cursor as:

“There is one game engine and one real-time layer.
Friend play and random play are just two different ways of creating a room.
Everything else is shared.”
