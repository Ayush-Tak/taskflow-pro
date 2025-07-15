import { useBoard } from "../contexts/BoardContext";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Card = ({ card, listID, wrapperClassName = "" }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { dispatch } = useBoard();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editedCardTitle, setEditedCardTitle] = useState(card.title);
  const [editedDescription, setEditedDescription] = useState(card.description);

  const handleDeleteCard = () => {
    dispatch({ type: "REMOVE_CARD", payload: { listID, cardID: card.id } });
  };

  const handleEditCardDetails = (e) => {
    e.preventDefault();
    if (editedCardTitle.trim() === "" || editedDescription.trim() === "") {
      setEditedCardTitle(card.title);
      setEditedDescription(card.description);
    } else {
      dispatch({
        type: "EDIT_CARD",
        payload: {
          listID: listID,
          cardID: card.id,
          newCardTitle: editedCardTitle.trim(),
          newDescription: editedDescription.trim(),
        },
      });
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setEditedCardTitle(card.title);
    setEditedDescription(card.description);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Card preview */}
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
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {card.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Click to edit</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal Panel */}
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-2 border-border rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all duration-300 hover:scale-[1.02] relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <h2 className="text-lg font-bold text-card-foreground">Edit Card</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-2xl text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleEditCardDetails} className="space-y-5">
                {/* Title */}
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

                {/* Description */}
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

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleDeleteCard}
                    className="px-6 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>
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