import { useState } from "react";
import { useBoard } from "../contexts/BoardContext";
import { useCardDragAndDrop } from "../hooks/useCardDragAndDrop";
import { createCardHandlers } from "../handlers/cardHandlers";
import { createTaskHandlers } from '../handlers/taskHandlers';

import Label from "./Label";
/**
 * Card Component
 * Represents a single card within a list in the Trello board
 * Provides drag-and-drop functionality and modal editing capabilities
 */
const Card = ({ card, listID, wrapperClassName = "" }) => {
  // Get dispatch function from board context for state updates
  const { dispatch } = useBoard();
  const { boardData } = useBoard();
  const globalLabels = boardData.labels;

  // Initialize drag-and-drop functionality for this card
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useCardDragAndDrop(card.id);

  // Local state for modal visibility and editing
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local state for edited card title (used in modal)
  const [editedCardTitle, setEditedCardTitle] = useState(card.title);

  // Local state for edited description (used in modal)
  const [editedDescription, setEditedDescription] = useState(card.description);

  // Local state for creating new labels
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("blue");

  // Create handler functions with proper closure over card data and dispatch
  const { handleDeleteCard, handleEditCardDetails, handleCloseModal } =
    createCardHandlers(card, listID, dispatch);

  // Create task-related handlers for this card
  const { handleUpdateCardDueDate, handleUpdateCardStatus } = createTaskHandlers(dispatch);

  // get current status info
  const currentStatus = boardData.taskStatuses?.find(
    (s) => s.id === (card.status || "todo")
  ) || { id: 'todo', name: 'To Do', color: 'gray' };

  // Get status class name for CSS variables
  const getStatusClass = (statusId) => {
    return `status-${statusId}`;
  };

  // Get due date class based on status
  const getDueDateClass = (statusId) => {
    if (statusId === 'missed') return 'status-missed';
    if (statusId === 'due-today') return 'status-due-today';
    if (statusId === 'this-week') return 'status-this-week';
    if (statusId === 'later') return 'status-later';
    return 'status-todo';
  };

  return (
    <>
      {/* Card Preview - the main card display that's draggable and clickable */}
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          p-3 rounded-lg shadow-sm transition-all duration-200 cursor-pointer border-l-4 border-l-primary/50 group sortable-card touch-optimized
          ${card.status === 'done' ? 'opacity-75 bg-muted/20' : ''}
          ${
            isDragging
              ? "bg-muted border-2 border-dashed border-primary opacity-70 shadow-lg dragging"
              : "bg-background hover:bg-secondary/30 border border-border hover:border-primary/50 hover:shadow-md"
          }
          ${wrapperClassName}
        `}
        onClick={() => setIsModalOpen(true)}
        data-testid="drag-handle"
        onTouchStart={(e) => {
          // Prevent scrolling during potential drag
          e.stopPropagation();
        }}
        onContextMenu={(e) => {
          // Prevent context menu on mobile long press during drag
          if (isDragging) {
            e.preventDefault();
          }
        }}
      >
        {/* Card status - visual indicator for current status */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${getStatusClass(currentStatus?.id)}`}
          >
            {currentStatus?.name || 'To Do'}
          </span>

          <div className="flex items-center space-x-2">
            {card.dueDate && (
              <span
                className={`text-xs px-2 py-1 rounded ${getDueDateClass(currentStatus?.id)}`}
              >
                {new Date(card.dueDate).toLocaleDateString()}
              </span>
            )}

            {/* Quick completion toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card modal from opening
                const newStatus = card.status === 'done' ? 'todo' : 'done';
                handleUpdateCardStatus(card.id, newStatus);
              }}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                card.status === 'done'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={card.status === 'done' ? 'Mark as not done' : 'Mark as done'}
            >
              {card.status === 'done' ? '✓' : '○'}
            </button>
          </div>
        </div>
        {/* Card title - primary text content */}
        <h3 className={`font-medium text-foreground group-hover:text-primary transition-colors leading-snug ${
          card.status === 'done' ? 'line-through text-muted-foreground' : ''
        }`}>
          {card.title}
        </h3>

        {/* Card description - optional secondary text */}
        {card.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Card labels - wrap and display properly */}
        {card.labelIds && card.labelIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.labelIds.map((labelId) => {
              const label = globalLabels.find((l) => l.id === labelId);
              return label ? <Label key={label.id} label={label} /> : null;
            })}
          </div>
        )}

        {/* Card footer - visual indicator and hint text */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Click to edit</span>
          </div>
        </div>
      </div>

      {/* Card Edit Modal - shown when isModalOpen is true */}
      {isModalOpen && (
        <>
          {/* Modal backdrop - darkens background and closes modal on click */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
            onClick={handleCloseModal(
              setEditedCardTitle,
              setEditedDescription,
              setIsModalOpen
            )}
          />

          {/* Modal panel - main modal container */}
          <div
            className="fixed inset-0 flex items-start justify-center z-50 p-4 md:p-8 overflow-y-auto modal-container"
            onClick={handleCloseModal(
              setEditedCardTitle,
              setEditedDescription,
              setIsModalOpen
            )}
          >
            {/* Modal content - prevents click propagation to backdrop */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-2 border-border rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl transform transition-all duration-300 hover:scale-[1.01] relative my-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin modal-content"
            >
              {/* Modal header - contains title and close button */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <h2 className="text-lg font-bold text-card-foreground">
                  Edit Card
                </h2>
                <button
                  onClick={handleCloseModal(
                    setEditedCardTitle,
                    setEditedDescription,
                    setIsModalOpen
                  )}
                  className="text-2xl text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Edit form - allows updating card title and description */}
              <form
                onSubmit={handleEditCardDetails(
                  editedCardTitle,
                  editedDescription,
                  setIsModalOpen
                )}
                className="space-y-5"
              >
                {/* Title input field */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-primary">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={editedCardTitle}
                    onChange={(e) => setEditedCardTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base min-h-[44px]"
                  />
                </div>

                {/* Description textarea field */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-primary">
                    Description
                  </label>
                  <textarea
                    placeholder="Add a more detailed description..."
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all h-32 resize-none text-base scrollbar-thin"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={card.dueDate ? card.dueDate.split("T")[0] : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? `${e.target.value}T00:00:00.000Z`
                        : null;
                      handleUpdateCardDueDate(card.id, dateValue, card.status);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-base min-h-[44px]"
                  />
                </div>

                {/* Task Completion Status */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-primary">
                    Task Completion
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        const newStatus = card.status === 'done' ? 'todo' : 'done';
                        handleUpdateCardStatus(card.id, newStatus);
                      }}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all min-h-[44px] ${
                        card.status === 'done'
                          ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">
                        {card.status === 'done' ? '✓' : '○'}
                      </span>
                      <span className="font-medium">
                        {card.status === 'done' ? 'Completed' : 'Mark as Done'}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {card.status === 'done'
                      ? 'Task is manually marked as completed and will remain done regardless of due date.'
                      : card.dueDate
                        ? 'Task status is automatically determined by due date. Click above to mark as completed.'
                        : 'Set a due date for automatic status updates, or mark as completed manually.'
                    }
                  </p>
                </div>
                {/* Labels section - allows adding/removing labels */}
                <div className="">
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-primary">
                    Selected Labels
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {card.labelIds?.map((labelId) => {
                      const label = boardData.labels.find(
                        (l) => l.id === labelId
                      );
                      return label ? (
                        <div key={label.id} className="flex items-center">
                          <Label
                            label={label}
                            showRemove={true}
                            onRemove={() => {
                              dispatch({
                                type: "REMOVE_LABEL_FROM_CARD",
                                payload: {
                                  listID,
                                  cardID: card.id,
                                  labelID: label.id,
                                },
                              });
                            }}
                          />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Available Labels Section */}
                <div className="">
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-primary">
                    Available Labels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {boardData.labels
                      .filter(
                        (label) => !(card.labelIds || []).includes(label.id)
                      )
                      .map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          className="opacity-60 hover:opacity-100 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({
                              type: "ADD_LABEL_TO_CARD",
                              payload: {
                                listID,
                                cardID: card.id,
                                labelID: label.id,
                              },
                            });
                          }}
                        >
                          <Label label={label} />
                        </button>
                      ))}
                  </div>
                </div>

                {/* Create New Label Section */}
                <div className="">
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-primary">
                    Create New Label
                  </label>
                  {!isCreatingLabel ? (
                    <button
                      type="button"
                      className="px-3 py-2 text-sm border-2 border-dashed border-muted-foreground/50 rounded-lg hover:border-primary transition-colors text-muted-foreground hover:text-primary"
                      onClick={() => setIsCreatingLabel(true)}
                    >
                      + Add New Label
                    </button>
                  ) : (
                    <div className="space-y-3 p-3 border-2 border-border rounded-lg bg-muted/10">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Label Name
                        </label>
                        <input
                          type="text"
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder="Enter label name..."
                          className="w-full px-2 py-1 text-sm border border-border rounded bg-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Color
                        </label>
                        <select
                          value={newLabelColor}
                          onChange={(e) => setNewLabelColor(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-border rounded bg-input"
                        >
                          <option value="red">Red</option>
                          <option value="yellow">Yellow</option>
                          <option value="green">Green</option>
                          <option value="blue">Blue</option>
                          <option value="purple">Purple</option>
                          <option value="pink">Pink</option>
                          <option value="indigo">Indigo</option>
                          <option value="gray">Gray</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (newLabelName.trim()) {
                              const newLabel = {
                                id: `label-${Date.now()}`,
                                color: newLabelColor,
                                text: newLabelName.trim(), // Use 'text' instead of 'name' for consistency
                              };
                              dispatch({
                                type: "ADD_LABEL",
                                payload: newLabel,
                              });
                              dispatch({
                                type: "ADD_LABEL_TO_CARD",
                                payload: {
                                  listID,
                                  cardID: card.id,
                                  labelID: newLabel.id,
                                },
                              });
                              setNewLabelName("");
                              setIsCreatingLabel(false);
                            }
                          }}
                        >
                          Create & Add
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
                          onClick={() => {
                            setIsCreatingLabel(false);
                            setNewLabelName("");
                            setNewLabelColor("blue");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal action buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  {/* Delete button - removes the card from the list */}
                  <button
                    type="button"
                    onClick={handleDeleteCard}
                    className="px-6 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>

                  {/* Save button - updates card with edited values */}
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Card;
