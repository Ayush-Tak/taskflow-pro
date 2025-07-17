import { createContext, useContext, useReducer, useEffect } from "react";

/**
 * Board Context
 * Provides global state management for the Trello board application
 * Manages lists, cards, and their operations through a centralized reducer
 */

// Create the context for board state management
// eslint-disable-next-line react-refresh/only-export-components
export const BoardContext = createContext();

/**
 * Board Reducer
 * Handles all state transitions for the board including:
 * - List operations (add, remove, edit, delete, reorder)
 * - Card operations (add, remove, edit, move between lists)
 * - Drag and drop state updates
 */
const reducer = (state, action) => {
  switch (action.type) {
    // List operations
    case "ADD_LIST":
      return [...state, action.payload];

    case "REMOVE_LIST":
      return state.filter((list) => list.id !== action.payload);

    case "EDIT_LIST_TITLE":
      return state.map((list) =>
        list.id === action.payload.listID
          ? { ...list, title: action.payload.newTitle }
          : list
      );

    case "DELETE_LIST":
      return state.filter((list) => list.id !== action.payload.listID);

    // Card operations
    case "ADD_CARD":
      return state.map((list) => {
        if (list.id === action.payload.listID) {
          return {
            ...list,
            cards: [...list.cards, action.payload.card],
          };
        }
        return list;
      });

    case "REMOVE_CARD":
      return state.map((list) => {
        if (list.id === action.payload.listID) {
          return {
            ...list,
            cards: list.cards.filter(
              (card) => card.id !== action.payload.cardID
            ),
          };
        }
        return list;
      });

    case "EDIT_CARD":
      return state.map((list) => {
        if (list.id === action.payload.listID) {
          const updatedCards = list.cards.map((card) => {
            if (card.id === action.payload.cardID) {
              return {
                ...card,
                title: action.payload.newCardTitle,
                description: action.payload.newDescription,
              };
            }
            return card;
          });
          return { ...list, cards: updatedCards };
        }
        return list;
      });

    // Drag and drop operations
    case "MOVE_CARD": {
      const { cardId, sourceListId, destListId, overCardId } = action.payload;
      let foundCard;

      // Find and remove the card from the source list
      const stateWithoutCard = state.map((list) => {
        if (list.id === sourceListId) {
          foundCard = list.cards.find((card) => card.id === cardId);
          return {
            ...list,
            cards: list.cards.filter((card) => card.id !== cardId),
          };
        }
        return list;
      });

      // If the card is not found, return the original state
      if (!foundCard) return state;

      // Add the card to the destination list in the correct position
      return stateWithoutCard.map((list) => {
        if (list.id === destListId) {
          // If dropping on another card, find its index
          if (overCardId) {
            const overIndex = list.cards.findIndex(
              (card) => card.id === overCardId
            );
            // Insert the card at that index
            const newCards = [...list.cards];
            newCards.splice(overIndex, 0, foundCard);
            return { ...list, cards: newCards };
          }
          // Otherwise, add to the end
          return { ...list, cards: [...list.cards, foundCard] };
        }
        return list;
      });
    }

    case "MOVE_LIST": {
      const { sourceIndex, destinationIndex } = action.payload;
      const updatedLists = Array.from(state);
      const [movedList] = updatedLists.splice(sourceIndex, 1);
      updatedLists.splice(destinationIndex, 0, movedList);
      return updatedLists;
    }

    default:
      return state;
  }
};

/**
 * Initial Board Data
 * Default data structure for the board when no saved data exists
 * Contains a tutorial list with example cards explaining how to use the app
 */
const initialBoardData = [
  {
    id: "list-1",
    title: "How to Use",
    cards: [
      {
        id: "card-1",
        title: "How Add cards?",
        description: "Click on add cards to add new cards in the list",
        labels: [
          {
            id: "label-1",
            color: "blue",
            name: "Tutorial",
          }
        ]
      },
      {
        id: "card-2",
        title: "How Add List",
        description: "Click on add new list to add lists",
        labels: [
          {
            id: "label-2",
            color: "green",
            name: "Tutorial",
          }
        ]
      },
      {
        id: "card-4",
        title: "How to Delete Card",
        description: "Click on the card to delete it",
      },
      {
        id: "card-5",
        title: "How to Drag and Drop Card",
        description:
          "Click and hold the card to drag it to another list or position",
      },
      {
        id: "card-3",
        title: "How to Edit Card",
        description: "Click on the card to edit its title and description",
      },
    ],
  },
];

/**
 * Load Initial State
 * Attempts to load saved board data from localStorage
 * Falls back to initial tutorial data if no saved data exists
 *
 * @returns {Array} Array of lists with their cards
 */
const loadInitialState = () => {
  try {
    const serializedState = localStorage.getItem("boardData");
    if (serializedState === null) {
      return initialBoardData;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading board data:", error);
    return initialBoardData;
  }
};

/**
 * Board Provider Component
 * Provides board state and dispatch function to all child components
 * Automatically saves state changes to localStorage for persistence
 *
 */
export const BoardProvider = ({ children }) => {
  // Initialize state with useReducer, loading from localStorage
  const [boardData, dispatch] = useReducer(reducer, loadInitialState());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const serializedState = JSON.stringify(boardData);
      localStorage.setItem("boardData", serializedState);
    } catch (error) {
      console.error("Error saving board data:", error);
    }
  }, [boardData]);

  return (
    <BoardContext.Provider value={{ boardData, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};

/**
 * useBoard Hook
 * Custom hook to access board context
 * Provides boardData and dispatch function to consuming components
 *
 * @returns {Object} Context value containing boardData and dispatch
 * @throws {Error} If used outside of BoardProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};
