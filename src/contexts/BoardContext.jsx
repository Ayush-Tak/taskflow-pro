import { createContext, useContext, useReducer, useEffect } from "react";
import { createTaskHandlers } from "../handlers/taskHandlers";
/**
 * TaskFlow Pro Board Context
 * Provides global state management for the intelligent kanban application
 * Manages lists, cards, smart task statuses, and their operations through a centralized reducer
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
    case "UPDATE_CARD_STATUS":
      return{
        ...state,
        lists: state.lists.map(list => ({
          ...list,
          cards: list.cards.map(card =>
            card.id === action.payload.cardId
              ? {
                ...card,
                status: action.payload.status,
                statusUpdatedAt: new Date().toISOString()
              }
              :card
          )
        }))
      };

      case "UPDATE_CARD_DUE_DATE":
      return {
        ...state,
        lists:state.lists.map(list =>({
          ...list,
          cards: list.cards.map(card =>
            card.id === action.payload.cardId
              ? {
                ...card,
                dueDate: action.payload.dueDate,
                status: action.payload.newStatus || card.status,
              }
              :card
          )
        }))
      };

      case "REFRESH_ALL_STATUSES":
        return {
          ...state,
          lists: state.lists.map(list => ({
            ...list,
            cards: list.cards.map(card => ({
              ...card,
              status: action.payload.cardStatuses[card.id] || card.status,
            }))
          }))
        };

    default:
      return state;
  }
};

/**
 * Initial Board Data
 * Default data structure for the board when no saved data exists
 * Contains comprehensive tutorial showcasing labels, task statuses, and due dates
 */
const initialBoardData = {
  labels: [
    { id: "label-1", color: "red", text: "Priority" },
    { id: "label-2", color: "blue", text: "Feature" },
    { id: "label-3", color: "green", text: "Bug Fix" },
    { id: "label-4", color: "purple", text: "Documentation" },
  ],
  lists: [
    {
      id: "list-1",
      title: "📚 Getting Started",
      cards: [
        {
          id: "card-1",
          title: "Welcome to TaskFlow Pro!",
          description: "This board demonstrates all the intelligent features. TaskFlow Pro automatically manages task statuses based on due dates while letting you manually mark tasks as complete. Click on any card to edit it, add due dates, and assign labels.",
          labelIds: ["label-4"],
          status: "todo"
        },
        {
          id: "card-2",
          title: "Smart Task Status System",
          description: "TaskFlow Pro intelligently manages task statuses:\n• Todo: No due date or future\n• Due Today: Due today (red)\n• This Week: Due in 1-7 days (yellow)\n• Later: Due beyond 7 days (blue)\n• Missed: Past due (purple)\n• Done: Manually completed (green)\n\nYou can only manually mark tasks as 'Done' - all other statuses are calculated automatically based on due dates!",
          labelIds: ["label-4"],
          status: "todo"
        },
        {
          id: "card-3",
          title: "Working with Labels",
          description: "Use labels to categorize tasks. Click the filter button in the header to filter by labels. You can create custom labels with different colors.",
          labelIds: ["label-4", "label-2"],
          status: "todo"
        }
      ]
    },
    {
      id: "list-2",
      title: "📋 Try These Features",
      cards: [
        {
          id: "card-4",
          title: "Add a Due Date",
          description: "Click this card and set a due date to see automatic status assignment in action!",
          labelIds: ["label-2"],
          status: "todo"
        },
        {
          id: "card-5",
          title: "Drag and Drop Cards",
          description: "Try dragging this card to another list. Works on both desktop and mobile!",
          labelIds: ["label-2"],
          status: "todo"
        },
        {
          id: "card-6",
          title: "Create New Labels",
          description: "Open this card and try creating a new label with your own color and name.",
          labelIds: ["label-2"],
          status: "todo"
        },
        {
          id: "card-7",
          title: "Filter by Labels",
          description: "Click the label filter button in the header to see filtering in action.",
          labelIds: ["label-2", "label-1"],
          status: "todo"
        }
      ]
    },
    {
      id: "list-3",
      title: "🎯 Sample Tasks with Status",
      cards: [
        {
          id: "card-8",
          title: "High Priority Bug Fix",
          description: "This card has a high priority label and shows how status works with due dates.",
          labelIds: ["label-1", "label-3"],
          status: "due-today",
          dueDate: new Date().toISOString().split('T')[0] + "T00:00:00.000Z" // Today
        },
        {
          id: "card-9",
          title: "Feature Planning Meeting",
          description: "This task is due this week and shows the yellow 'This Week' status.",
          labelIds: ["label-2"],
          status: "this-week",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T00:00:00.000Z" // 3 days from now
        },
        {
          id: "card-10",
          title: "Update Documentation",
          description: "This task is due later and shows the blue 'Later' status.",
          labelIds: ["label-4"],
          status: "later",
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T00:00:00.000Z" // 2 weeks from now
        },
        {
          id: "card-11",
          title: "Missed Deadline Example",
          description: "This shows what happens when a task is past due - it gets purple 'Missed' status automatically.",
          labelIds: ["label-1"],
          status: "missed",
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T00:00:00.000Z" // 2 days ago
        }
      ]
    },
    {
      id: "list-4",
      title: "✅ Completed",
      cards: [
        {
          id: "card-12",
          title: "Setup Project Structure",
          description: "This task is marked as done and keeps its green status regardless of due date. Notice the strikethrough and muted appearance.",
          labelIds: ["label-3"],
          status: "done",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T00:00:00.000Z" // Yesterday
        },
        {
          id: "card-13",
          title: "Try Marking This Complete",
          description: "Click the ○ button on this card to mark it as done, or use the completion button in the modal. This is the only status you can set manually!",
          labelIds: ["label-2"],
          status: "todo"
        }
      ]
    }
  ],
  // Filter state
  activeFilters: [], // Array of label IDs to filter by
  taskStatuses: [
    { id: 'todo', name: 'To Do', color: 'gray' },
    { id: 'due-today', name: 'Due Today', color: 'red' },
    { id: 'this-week', name: 'This Week', color: 'yellow' },
    { id: 'later', name: 'Later', color: 'blue' },
    { id: 'done', name: 'Done', color: 'green' },
    { id: 'missed', name: 'Missed', color: 'purple' }
  ]
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
    // MIGRATION:
    if (
      typeof parsed !== "object" ||
      !Array.isArray(parsed.lists) ||
      !Array.isArray(parsed.labels)
    ) {
      return initialBoardData;
    }
    if (!parsed.activeFilters) {
      parsed.activeFilters = [];
    }
    if (!parsed.taskStatuses) {
      parsed.taskStatuses = [
        { id: 'todo', name: 'To Do', color: 'gray' },
        { id: 'due-today', name: 'Due Today', color: 'red' },
        { id: 'this-week', name: 'This Week', color: 'yellow' },
        { id: 'later', name: 'Later', color: 'blue' },
        { id: 'done', name: 'Done', color: 'green' },
        { id: 'missed', name: 'Missed', color: 'purple' }
      ];
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

  // Set up an interval to refresh task statuses every hour
  useEffect(() => {
    const { handleRefreshAllStatuses } = createTaskHandlers(dispatch);

    const interval = setInterval(() => {
      handleRefreshAllStatuses(boardData);
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, [boardData, dispatch]);
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
