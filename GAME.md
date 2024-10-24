# Terminology

- CLI
- Effect
- Command
- Program
- Deck
- Script
- Server
- Installation
- Trap
- ICE
- Daemon
- Behavior
- Trigger

### CLI

Command Line Interface - what the player uses to run commands, programs, or scripts.

### Effect

An Effect is a single change to the game world, and these are executed in order from the Game Stack (which is technically more of a game-queue right now).

### Command

A command is a single instruction that can modify the game world, by placing a new Effect into the Game Stack.

Commands can be initiated by the player via the CLI, or from Programs, Daemons, or Scripts.

### Program

A program is a collection of commands that can be run by the player or a Daemon.

### Deck

The Player's Deck is their collection of Programs, Commands, and Scripts - which can be slotted out between games according to the player's wishes.

### Script

A consumable, it runs a Command or Program when activated, then disappears.

### Server

A node in the game world where assets can be installed, and the player may traverse and interact with.

### Installation

An asset that benefits the Corp, installed in a Server (node) and may be interacted with by the player to take it over or otherwise produce some effect.

### Trap

A special type of Server content that will trigger when the player interacts with it, usually to the player's detriment.

### ICE

Installed on a Server to protect it from being hacked by the player. Players cannot interact with a server while ICE is active on it, though they usually do not otherwise impede the Player.

### Daemon

A Daemon is a special type of Program that runs automatically, usually after the Player ends their turn, but will run various Behaviors in response to specified Triggers.

### Behavior

A set of instructions that a Daemon will run when a Trigger is met. Usually by adding Game Effects to the Stack.

### Trigger

A condition that, when met, will cause a Daemon to run its Behaviors.
