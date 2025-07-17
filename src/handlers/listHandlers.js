import { v4 as uuidv4 } from "uuid";

/**
 * List-level action handlers
 * Contains handlers for list operations like adding cards, editing titles, deleting lists
 * These are factory functions that create handlers with proper closure over list data and dispatch
 */

/**
 * Creates list-related action handlers
 * Uses closure to capture list data and dispatch function
 *
 * @param {Object} list - List object containing id, title, and cards
 * @param {Function} dispatch - Redux-like dispatch function for state updates
 * @returns {Object} Object containing all list action handlers
 */
export const createListHandlers = (list, dispatch) => {
  /**
   * Handles adding a new card to the list
   * Validates input, creates new card with UUID, and updates list state
   *
   * @param {string} newCardTitle - Title for the new card
   * @param {Function} setNewCardTitle - State setter for card title input
   * @param {Function} setIsAddingCard - State setter for add card mode
   * @returns {Function} Form submit handler
   */
  const handleAddCard = (newCardTitle, setNewCardTitle, setIsAddingCard) => (e) => {
    e.preventDefault();

    // Validate input - don't create empty cards
    if (newCardTitle.trim() === "") return;

    // Create new card with unique ID and empty description
    const newCard = {
      id: uuidv4(),
      title: newCardTitle,
      description: "",
    };

    // Add card to the list
    dispatch({
      type: "ADD_CARD",
      payload: { listID: list.id, card: newCard },
    });

    // Reset form state
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  /**
   * Handles editing the list title
   * Validates input and updates list title, or reverts to original if empty
   *
   * @param {string} editedTitle - New title for the list
   * @param {Function} setEditedTitle - State setter for edited title
   * @param {Function} setIsEditingTitle - State setter for edit mode
   * @returns {Function} Form submit handler
   */
  const handleEditTitle = (editedTitle, setEditedTitle, setIsEditingTitle) => (e) => {
    e.preventDefault();

    // If empty, revert to original title
    if (editedTitle.trim() === "") {
      setEditedTitle(list.title);
    } else {
      // Update list title
      dispatch({
        type: "EDIT_LIST_TITLE",
        payload: { listID: list.id, newTitle: editedTitle.trim() },
      });
    }

    // Exit edit mode
    setIsEditingTitle(false);
  };

  /**
   * Handles deleting the entire list
   * Shows confirmation dialog and deletes list with all its cards
   *
   * @returns {Function} Delete handler
   */
  const handleDeleteList = () => {
    // Confirm deletion since this is destructive
    if (window.confirm("Are you sure you want to delete this list and all its cards?")) {
      dispatch({
        type: "DELETE_LIST",
        payload: { listID: list.id },
      });
    }
  };

  return {
    handleAddCard,      // Handler for adding new cards
    handleEditTitle,    // Handler for editing list title
    handleDeleteList,   // Handler for deleting the list
  };
};
