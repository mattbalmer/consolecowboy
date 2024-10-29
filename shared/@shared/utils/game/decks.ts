import {
  Command,
  Deck,
  DeckSlot,
  Firmware,
  Game,
  Player,
  Program, ProgramKeyword,
  SavedDeckSlot,
  SavedScript,
  Script
} from '@shared/types/game';
import { Firmwares } from '@shared/constants/firmware';
import { Programs } from '@shared/constants/programs';
import { Scripts } from '@shared/constants/scripts';
import { CORE_COMMANDS } from '@shared/constants/commands';
import { GameError } from '@shared/errors/GameError';

export const addScript = (deck: Deck, script: Script): Deck => {
  const scripts = Object.entries(deck.scripts);
  const key = scripts
    .find(([id, s]) => s === null)?.[0] || null;
  if (!key) {
    if (scripts.length < deck.scriptCapacity) {
      deck.scripts[scripts.length] = script;
      return deck;
    } else {
      throw new GameError(`Deck's script storage is full`);
    }
  }
  deck.scripts[key] = script;
  return deck;
}

export const addProgram = (deck: Deck, program: Program | Firmware): Deck => {
  const programs = Object.entries(deck.programs);
  const key = programs
    .find(([id, slot]) => slot === null || slot.content === null)?.[0] || null;
  if (!key) {
    if (programs.length < deck.programCapacity) {
      deck.programs[programs.length] = {
        type: 'program', // todo: firmware
        content: program as Program,
      };
      return deck;
    } else {
      throw new GameError(`Deck's program storage is full`);
    }
  }
  deck.programs[key] = program;
  return deck;
}

export const hydrateDeckSlot = (slot: SavedDeckSlot): DeckSlot => {
  if (slot === null) {
    return null;
  }

  const deckSlot: DeckSlot = {
    type: slot.type,
    content: null,
  };

  if (slot.type === 'firmware') {
    deckSlot.content = slot.content && Firmwares[slot.content]();
  } else if (slot.type === 'program') {
    deckSlot.content = slot.content && Programs[slot.content]();
  } else {
    throw `Cannot hydrate deck with slot type ${slot.type}: ${slot.content}`;
  }

  if (slot.isRemoveable === false) {
    deckSlot.isRemoveable = slot.isRemoveable;
  }

  return deckSlot;
}

export const hydrateScript = (script: SavedScript): Script => {
  if (script === null || !script.id) {
    return null;
  }

  return Scripts[script.id](script.props);
}

export const hydrateDeck = (deck: Player['deck']): Game['player']['deck'] => {
  return {
    ...deck,
    programs: Object.fromEntries(
      Object.entries(deck.programs).map<[string, DeckSlot]>(
        ([id, slot]) => [id, hydrateDeckSlot(slot)]
      )
    ),
    scripts: Object.fromEntries(
      Object.entries(deck.scripts).map<[string, Script]>(
        ([id, script]) => [id, hydrateScript(script)]
      )
    ),
  }
}

export const dehydrateDeck = (deck: Game['player']['deck']): Player['deck'] => {
  return {
    ...deck,
    programs: Object.fromEntries(
      Object.entries(deck.programs).map<[string, SavedDeckSlot]>(
        ([id, slot]) => [id, slot ? {
          type: slot.type,
          content: slot.content.id,
          isRemoveable: slot.isRemoveable ?? true,
        } : null]
      )
    ),
    scripts: Object.fromEntries(
      Object.entries(deck.scripts).map<[string, SavedScript]>(
        ([id, script]) => [id, script ? {
          id: script.id,
          props: script.props,
        } : null]
      )
    ),
  }
}

export const commandsForDeck = (deck: Deck): (Command | ProgramKeyword)[] => {
  return Object.values(deck.programs)
    .filter(slot => Boolean(slot && slot.content))
    .map(slot => {
      return slot.type === 'program' ? [
        (slot.content as Program).keyword
      ] : (slot.content as Firmware<'core'>).id === 'core1' ? CORE_COMMANDS : [];
    })
    .flat();
}