/**
 * Auto-calculate task status based on due date
 * @param {string|null} dueDate - ISO date string or null
 * @param {string} currentStatus - Current status of the card
 * @param {boolean} preserveManualStatus - Whether to preserve manual status overrides
 * @returns {string} New status based on due date logic
 */
const calculateAutoStatus = (dueDate, currentStatus = "todo", preserveManualStatus = true) => {
  if (!dueDate) return currentStatus || 'todo';

  const now = new Date();
  const due = new Date(dueDate);

  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const timeDiff = due.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Always preserve manually set "done" status
  if (currentStatus === 'done' && preserveManualStatus) {
    return currentStatus;
  }

  // Auto-assign based on due date
  if (daysDiff < 0) {
    return "missed"; // Past due date
  } else if (daysDiff === 0) {
    return "due-today"; // Due today
  } else if (daysDiff <= 7) {
    return "this-week"; // Due between tomorrow and 7 days
  } else {
    return "later"; // Due beyond 7 days
  }
};

// calc status for all cards in board
const calculateAllCardStatuses = (boardData) => {
  const cardStatuses = {};

  boardData.lists.forEach(list => {
    list.cards.forEach(card => {
      cardStatuses[card.id] = calculateAutoStatus(card.dueDate, card.status);
    });
  });

  return cardStatuses;
};

/**
 * Task Handlers Factory
 * Creates handler functions with closure over dispatch
 */
export const createTaskHandlers = (dispatch) => ({
  handleUpdateCardStatus: (cardId, status) => {
    // Only allow manual setting to "done" or "todo" - other statuses are auto-calculated
    if (status === 'done' || status === 'todo') {
      dispatch({
        type: "UPDATE_CARD_STATUS",
        payload: { cardId, status }
      });
    }
  },

  handleUpdateCardDueDate: (cardId, dueDate, currentStatus) => {
    // Only auto-calculate status if not manually set to done
    const newStatus = currentStatus === 'done'
      ? 'done'
      : calculateAutoStatus(dueDate, currentStatus);

    dispatch({
      type: "UPDATE_CARD_DUE_DATE",
      payload: { cardId, dueDate, newStatus }
    });
  },

  handleToggleCardCompletion: (cardId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    dispatch({
      type: "UPDATE_CARD_STATUS",
      payload: { cardId, status: newStatus }
    });
  },

  handleMarkListComplete: (listId, boardData) => {
    const list = boardData.lists.find(l => l.id === listId);
    if (!list) return;

    list.cards.forEach(card => {
      if (card.status !== 'done') {
        dispatch({
          type: "UPDATE_CARD_STATUS",
          payload: { cardId: card.id, status: 'done' }
        });
      }
    });
  },

  handleRefreshAllStatuses: (boardData) => {
    const cardStatuses = calculateAllCardStatuses(boardData);
    dispatch({
      type: "REFRESH_ALL_STATUSES",
      payload: { cardStatuses }
    });
  }
});

export { calculateAutoStatus };