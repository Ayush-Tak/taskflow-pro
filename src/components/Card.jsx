import { useState } from "react";
import { useBoard } from "../contexts/BoardContext";
import { useCardDragAndDrop } from "../hooks/useCardDragAndDrop";
import { createCardHandlers } from "../handlers/cardHandlers";

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
  const { attributes, listeners, setNodeRef, style, isDragging } = useCardDragAndDrop(card.id);

  // Local state for modal visibility and editing
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local state for edited card title (used in modal)
  const [editedCardTitle, setEditedCardTitle] = useState(card.title);

  // Local state for edited description (used in modal)
  const [editedDescription, setEditedDescription] = useState(card.description);

  // Create handler functions with proper closure over card data and dispatch
  const { handleDeleteCard, handleEditCardDetails, handleCloseModal } = createCardHandlers(card, listID, dispatch);

  return (
    <>
      {/* Card Preview - the main card display that's draggable and clickable */}
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          p-3 rounded-lg shadow-sm transition-all duration-200 cursor-pointer border-l-4 border-l-primary/50 group
          ${
            isDragging
              ? "bg-muted border-2 border-dashed border-primary opacity-70 shadow-lg"
              : "bg-background hover:bg-secondary/30 border border-border hover:border-primary/50 hover:shadow-md"
          }
          ${wrapperClassName}
        `}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Card title - primary text content */}
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
          {card.title}
        </h3>

        {/* Card description - optional secondary text */}
        {card.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Card footer - visual indicator and hint text */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            {card.labelIds && card.labelIds.map((labelId) => {
              const label = globalLabels.find((l) => l.id === labelId);
              return label ? (<Label key={label.id} color={label.color} name={label.name} />) : null;
            })}
          </div>
        </div>
      </div>

      {/* Card Edit Modal - shown when isModalOpen is true */}
      {isModalOpen && (
        <>
          {/* Modal backdrop - darkens background and closes modal on click */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
            onClick={handleCloseModal(setEditedCardTitle, setEditedDescription, setIsModalOpen)}
          />

          {/* Modal panel - main modal container */}
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal(setEditedCardTitle, setEditedDescription, setIsModalOpen)}
          >
            {/* Modal content - prevents click propagation to backdrop */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-2 border-border rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all duration-300 hover:scale-[1.02] relative"
            >
              {/* Modal header - contains title and close button */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <h2 className="text-lg font-bold text-card-foreground">Edit Card</h2>
                <button
                  onClick={handleCloseModal(setEditedCardTitle, setEditedDescription, setIsModalOpen)}
                  className="text-2xl text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Edit form - allows updating card title and description */}
              <form onSubmit={handleEditCardDetails(editedCardTitle, editedDescription, setIsModalOpen)} className="space-y-5">
                {/* Title input field */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-primary">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={editedCardTitle}
                    onChange={(e) => setEditedCardTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all h-32 resize-none"
                  />
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