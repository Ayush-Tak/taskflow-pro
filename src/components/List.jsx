import { useState, useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useBoard } from "../contexts/BoardContext";
import { useListDragAndDrop } from "../hooks/useListDragAndDrop";
import { createListHandlers } from "../handlers/listHandlers";
import { getListColorIndex, getListColorSet } from "../utils/listColors";
import Card from "./Card";

/**
 * List Component
 * Represents a single list in the Trello board
 * Contains a header, cards container, and add card functionality
 * Supports drag-and-drop for reordering lists and contains droppable area for cards
 *
 * @param {Object} props - Component props
 * @param {Object} props.list - The list object containing id, title, and cards
 * @param {string} props.list.id - Unique identifier for the list
 * @param {string} props.list.title - Display title of the list
 * @param {Array} props.list.cards - Array of card objects in this list
 * @returns {JSX.Element} Rendered list component
 */
const List = ({ list }) => {
  // Get dispatch function from board context
  const { dispatch } = useBoard();

  // Initialize drag-and-drop functionality for this list
  const { combineRefs, style, attributes, listeners, isDragging } = useListDragAndDrop(list.id);

  // Local state for list functionality
  const [isAddingCard, setIsAddingCard] = useState(false);      // Toggle for add card form
  const [newCardTitle, setNewCardTitle] = useState("");         // Input value for new card
  const [isEditingTitle, setIsEditingTitle] = useState(false);  // Toggle for title editing
  const [editedTitle, setEditedTitle] = useState(list.title);   // Input value for edited title

  // Color theming - memoized for performance
  const colorIndex = useMemo(() => getListColorIndex(list.id), [list.id]);
  const colorSet = useMemo(() => getListColorSet(list.id), [list.id]);

  // Get configured handlers for list actions
  const { handleAddCard, handleEditTitle, handleDeleteList } = createListHandlers(list, dispatch);

  // Extract card IDs for sortable context
  const cardIds = list.cards.map((card) => card.id);

  return (
    <div ref={combineRefs} style={style} className="w-72 flex-shrink-0">
      <div
        className={`flex flex-col h-full rounded-lg shadow-lg border-2 transition-all duration-200 ${
          isDragging ? 'shadow-2xl' : 'hover:shadow-xl'
        }`}
        style={{
          backgroundColor: `var(--list-bg-${colorIndex})`,
          borderColor: isDragging ? `var(--list-border-${colorIndex})` : 'var(--color-border)'
        }}
      >
        {/* List Header - contains title, card count, and delete button */}
        <div
          className="p-4 flex justify-between items-center rounded-t-lg border-b"
          style={{
            backgroundColor: `var(--list-bg-${colorIndex})`,
            borderBottomColor: `var(--list-border-${colorIndex})`
          }}
        >
          {/* Title Section - toggles between display and edit mode */}
          {isEditingTitle ? (
            // Edit mode - inline form for title editing
            <form onSubmit={handleEditTitle(editedTitle, setEditedTitle, setIsEditingTitle)} className="flex-1 mr-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleEditTitle(editedTitle, setEditedTitle, setIsEditingTitle)}
                autoFocus
                className="w-full bg-input text-foreground border border-border rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </form>
          ) : (
            // Display mode - shows title with drag handle
            <h2
              {...attributes}
              {...listeners}
              className="font-bold cursor-grab flex-1"
              style={{
                color: `var(--list-text-${colorIndex})`
              }}
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h2>
          )}

          {/* Header Actions - card count and delete button */}
          <div className="flex items-center space-x-2">
            {/* Card count badge */}
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `var(--list-border-${colorIndex})`,
                color: 'white'
              }}
            >
              {list.cards.length}
            </span>

            {/* Delete list button */}
            <button
              onClick={handleDeleteList}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="Delete list"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Cards Container - scrollable area containing all cards */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-[100px] bg-card/50">
          {/* Sortable context for card reordering */}
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {list.cards.map((card) => (
              <Card key={card.id} card={card} listID={list.id} />
            ))}
          </SortableContext>

          {/* Empty state - shown when list has no cards */}
          {list.cards.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No cards yet</p>
            </div>
          )}
        </div>

        {/* Add Card Section - footer with add card form or button */}
        <div
          className="p-3 rounded-b-lg border-t"
          style={{
            backgroundColor: `var(--list-bg-${colorIndex})`,
            borderTopColor: `var(--list-border-${colorIndex})`
          }}
        >
          {isAddingCard ? (
            // Add Card Form
            <form onSubmit={handleAddCard(newCardTitle, setNewCardTitle, setIsAddingCard)} className="space-y-2">
              <textarea
                placeholder="Enter a title for this card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                autoFocus
                className="w-full p-3 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                rows="2"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-md text-white font-medium transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: `var(--list-border-${colorIndex})`
                  }}
                >
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="w-12 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  ❌
                </button>
              </div>
            </form>
          ) : (
            // Add Card Button
            <button
              onClick={() => setIsAddingCard(true)}
              className="w-full p-3 text-left rounded-md border border-dashed border-muted hover:border-primary/50 bg-card hover:bg-card/80 text-card-foreground transition-colors"
            >
              + Add a card
            </button>
          )}
        </div>
      </div>

      {/* Dynamic CSS Variables - injects list-specific colors into CSS */}
      <style jsx>{`
        :root {
          --list-bg-${colorIndex}: ${colorSet.light.bg};
          --list-border-${colorIndex}: ${colorSet.light.border};
          --list-text-${colorIndex}: ${colorSet.light.text};
        }

        .dark {
          --list-bg-${colorIndex}: ${colorSet.dark.bg};
          --list-border-${colorIndex}: ${colorSet.dark.border};
          --list-text-${colorIndex}: ${colorSet.dark.text};
        }
      `}</style>
    </div>
  );
};

export default List;