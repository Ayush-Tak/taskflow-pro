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
      return { ...state, lists: [...state.lists, action.payload] };

    case "DELETE_LIST":
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== action.payload.listID),
      };

    case "EDIT_LIST_TITLE":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.listID
            ? { ...list, title: action.payload.newTitle }
            : list
        ),
      };

    // Card operations
    case "ADD_CARD":
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.listID) {
            return {
              ...list,
              cards: [...list.cards, action.payload.card],
            };
          }
          return list;
        }),
      };

    case "REMOVE_CARD":
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.listID) {
            return {
              ...list,
              cards: list.cards.filter(
                (card) => card.id !== action.payload.cardID
              ),
            };
          }
          return list;
        }),
      };

    case "EDIT_CARD":
      return {
        ...state,
        lists: state.lists.map((list) => {
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
        }),
      };

    // Drag and drop: Move Card
    case "MOVE_CARD": {
      const { cardId, sourceListId, destListId, overCardId } = action.payload;
      let foundCard;

      // Remove card from source list
      const listsWithoutCard = state.lists.map((list) => {
        if (list.id === sourceListId) {
          foundCard = list.cards.find((card) => card.id === cardId);
          return {
            ...list,
            cards: list.cards.filter((card) => card.id !== cardId),
          };
        }
        return list;
      });

      if (!foundCard) return state;

      // Insert card into destination list at correct position
      const newLists = listsWithoutCard.map((list) => {
        if (list.id === destListId) {
          let newCards;
          if (overCardId) {
            const overIndex = list.cards.findIndex(
              (card) => card.id === overCardId
            );
            newCards = [...list.cards];
            newCards.splice(overIndex, 0, foundCard);
          } else {
            newCards = [...list.cards, foundCard];
          }
          return { ...list, cards: newCards };
        }
        return list;
      });

      return { ...state, lists: newLists };
    }

    // Drag and drop: Move List
    case "MOVE_LIST": {
      const { sourceIndex, destinationIndex } = action.payload;
      const updatedLists = Array.from(state.lists);
      const [movedList] = updatedLists.splice(sourceIndex, 1);
      updatedLists.splice(destinationIndex, 0, movedList);
      return { ...state, lists: updatedLists };
    }

    // Label operations
    case "ADD_LABEL":
      return { ...state, labels: [...state.labels, action.payload] };

    case "REMOVE_LABEL":
      return {
        ...state,
        labels: state.labels.filter(
          (label) => label.id !== action.payload.labelID
        ),
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) => ({
            ...card,
            labelIds: (card.labelIds || []).filter(
              (id) => id !== action.payload.labelID
            ),
          })),
        })),
      };

    case "EDIT_LABEL":
      return {
        ...state,
        labels: state.labels.map((label) =>
          label.id === action.payload.labelId
            ? { ...label, text: action.payload.text, color: action.payload.color }
            : label
        ),
      };

    case "DELETE_LABEL":
      return {
        ...state,
        labels: state.labels.filter(label => label.id !== action.payload.labelId),
        // Remove the label from all cards
        lists: state.lists.map(list => ({
          ...list,
          cards: list.cards.map(card => ({
            ...card,
            labelIds: (card.labelIds || []).filter(id => id !== action.payload.labelId)
          }))
        })),
        // Remove from active filters if present
        activeFilters: (state.activeFilters || []).filter(id => id !== action.payload.labelId)
      };

    case "ADD_LABEL_TO_CARD": {
      const { listID, cardID, labelID } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listID
            ? {
                ...list,
                cards: list.cards.map((card) =>
                  card.id === cardID && !(card.labelIds || []).includes(labelID)
                    ? { ...card, labelIds: [...(card.labelIds || []), labelID] }
                    : card
                ),
              }
            : list
        ),
      };
    }

    case "REMOVE_LABEL_FROM_CARD": {
      const { listID, cardID, labelID } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listID
            ? {
                ...list,
                cards: list.cards.map((card) =>
                  card.id === cardID
                    ? { ...card, labelIds: (card.labelIds || []).filter(id => id !== labelID) }
                    : card
                ),
              }
            : list
        ),
      };
    }

    // Filter operations
    case "TOGGLE_LABEL_FILTER": {
      const { labelId } = action.payload;
      const isActive = (state.activeFilters || []).includes(labelId);
      return {
        ...state,
        activeFilters: isActive
          ? (state.activeFilters || []).filter(id => id !== labelId)
          : [...(state.activeFilters || []), labelId]
      };
    }

    case "CLEAR_ALL_FILTERS":
      return {
        ...state,
        activeFilters: []
      };

    default:
      return state;
  }
};

/**
 * Initial Board Data
 * Default data structure for the board when no saved data exists
 * Contains a tutorial list with example cards explaining how to use the app
 */
const initialBoardData = {
  labels: [
    { id: "label-1", color: "red", text: "Important" },
    { id: "label-2", color: "yellow", text: "Optional" },
    { id: "label-3", color: "green", text: "Done"},
    {id : "label-4", color:"blue", text:"Missed"},
  ],
  lists: [
    {
      id: "list-1",
      title: "How to Use",
      cards: [
        {
          id: "card-1",
          title: "How Add cards?",
          description: "Click on add cards to add new cards in the list",
          labelIds: ["label-1", "label-2"],
        },
        {
          id: "card-2",
          title: "How Add List",
          description: "Click on add new list to add lists",
          labelIds: ["label-1"],
        },
        {
          id: "card-4",
          title: "How to Delete Card",
          description: "Click on the card to delete it",
          labelIds: ["label-3"]
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
          labelIds:["label-4"]
        },
      ],
    },
  ],
  // Filter state
  activeFilters: [], // Array of label IDs to filter by
};

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
    const parsed = JSON.parse(serializedState);
    // MIGRATION: If old or invalid data shape, reset to initialBoardData
    if (
      typeof parsed !== "object" ||
      !Array.isArray(parsed.lists) ||
      !Array.isArray(parsed.labels)
    ) {
      return initialBoardData;
    }
    // Add activeFilters if missing (for migration from older versions)
    if (!parsed.activeFilters) {
      parsed.activeFilters = [];
    }
    return parsed;
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
