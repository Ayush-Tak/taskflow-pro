/**
 * Card-level action handlers
 * Contains handlers for card operations like editing, deleting, and modal management
 * These are factory functions that create handlers with proper closure over card data and dispatch
 */

/**
 * Creates card-related action handlers
 * Uses closure to capture card data, list ID, and dispatch function
 *
 * @param {Object} card - Card object containing id, title, and description
 * @param {string} listID - ID of the list containing this card
 * @param {Function} dispatch - Redux-like dispatch function for state updates
 * @returns {Object} Object containing all card action handlers
 */
export const createCardHandlers = (card, listID, dispatch) => {
  /**
   * Handles deleting the card
   * Removes card from its parent list immediately (no confirmation)
   *
   * @returns {Function} Delete handler
   */
  const handleDeleteCard = () => {
    dispatch({
      type: "REMOVE_CARD",
      payload: { listID, cardID: card.id }
    });
  };

  /**
   * Handles editing card details (title and description)
   * Validates input and updates card data, then closes modal
   *
   * @param {string} editedCardTitle - New title for the card
   * @param {string} editedDescription - New description for the card
   * @param {Function} setIsModalOpen - State setter for modal visibility
   * @returns {Function} Form submit handler
   */
  const handleEditCardDetails = (editedCardTitle, editedDescription, setIsModalOpen) => (e) => {
    e.preventDefault();

    // Validate input - only title is required
    if (editedCardTitle.trim() === "") {
      return;
    }

    // Update card with new details
    dispatch({
      type: "EDIT_CARD",
      payload: {
        listID: listID,
        cardID: card.id,
        newCardTitle: editedCardTitle.trim(),
        newDescription: editedDescription.trim(),
      },
    });

    // Close the edit modal
    setIsModalOpen(false);
  };

  /**
   * Handles closing the card edit modal
   * Resets form state to original values and closes modal
   *
   * @param {Function} setEditedCardTitle - State setter for card title input
   * @param {Function} setEditedDescription - State setter for card description input
   * @param {Function} setIsModalOpen - State setter for modal visibility
   * @returns {Function} Close handler
   */
  const handleCloseModal = (setEditedCardTitle, setEditedDescription, setIsModalOpen) => () => {
    // Reset form to original card values
    setEditedCardTitle(card.title);
    setEditedDescription(card.description);

    // Close modal
    setIsModalOpen(false);
  };


  return {
    handleDeleteCard,       // Handler for deleting the card
    handleEditCardDetails,  // Handler for editing card details
    handleCloseModal,       // Handler for closing edit modal
  };
};
