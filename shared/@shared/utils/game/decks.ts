import { Command, Deck, DeckSlot, Game, Player, Program, SavedDeckSlot, SavedScript, Script } from '@shared/types/game';
import { Programs } from '@shared/constants/programs';
import { Scripts } from '@shared/constants/scripts';
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

export const addModule = (deck: Deck, type: 'program' | 'firmware', program: Program): Deck => {
  const programs = Object.entries(deck.programs);
  const key = programs
    .find(([id, slot]) =>
      slot.type === type && slot.content === null
    )?.[0] || null;

  if (key) {
    deck.programs[key].content = program;
    return deck;
  } else {
    throw new GameError(`Deck's program storage is full`);
  }
}

export const hydrateDeckSlot = (slot: SavedDeckSlot): DeckSlot => {
  if (slot === null) {
    return null;
  }

  const deckSlot: DeckSlot = {
    type: slot.type,
    content: slot.content ? Programs[slot.content]() : null,
  };

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

export const commandMap = (deck: Deck): Record<Command, Program> => {
  return Object.values(deck.programs)
    .filter(slot => Boolean(slot && slot.content))
    .reduce((map, slot) => {
      const commands = slot.type === 'program'
        ? slot.content.commands
        : [];
      commands.forEach(command => {
        map[command] = slot.content as Program;
      });
      return map;
    }, {} as Record<Command, Program>);
}