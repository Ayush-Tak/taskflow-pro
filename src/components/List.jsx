import Card from "./Card";
import { useBoard } from "../contexts/BoardContext";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

const List = ({ list }) => {
  const { dispatch } = useBoard();
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id: list.id });
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const combineRefs = (node) => {
    setDroppableNodeRef(node);
    setSortableNodeRef(node);
  };

  const listColors = useMemo(() => [
    // Blues
    {
      light: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
      dark: { bg: '#1a237e', border: '#64b5f6', text: '#90caf9' }
    },
    // Greens
    {
      light: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' },
      dark: { bg: '#1b5e20', border: '#81c784', text: '#a5d6a7' }
    },
    // Oranges
    {
      light: { bg: '#fff3e0', border: '#ff9800', text: '#f57c00' },
      dark: { bg: '#e65100', border: '#ffb74d', text: '#ffcc02' }
    },
    // Purples
    {
      light: { bg: '#f3e5f5', border: '#9c27b0', text: '#7b1fa2' },
      dark: { bg: '#4a148c', border: '#ba68c8', text: '#ce93d8' }
    },
    // Teals
    {
      light: { bg: '#e0f2f1', border: '#009688', text: '#00695c' },
      dark: { bg: '#004d40', border: '#4db6ac', text: '#80cbc4' }
    },
    // Cyans
    {
      light: { bg: '#e1f5fe', border: '#00bcd4', text: '#0097a7' },
      dark: { bg: '#006064', border: '#4dd0e1', text: '#80deea' }
    },
    // Light Greens
    {
      light: { bg: '#f1f8e9', border: '#8bc34a', text: '#558b2f' },
      dark: { bg: '#33691e', border: '#aed581', text: '#c5e1a5' }
    },
    // Pinks
    {
      light: { bg: '#fce4ec', border: '#e91e63', text: '#c2185b' },
      dark: { bg: '#880e4f', border: '#f06292', text: '#f8bbd9' }
    },
    // Indigos
    {
      light: { bg: '#e8eaf6', border: '#3f51b5', text: '#303f9f' },
      dark: { bg: '#1a237e', border: '#7986cb', text: '#9fa8da' }
    },
    // Lime
    {
      light: { bg: '#f9fbe7', border: '#cddc39', text: '#827717' },
      dark: { bg: '#827717', border: '#dce775', text: '#f0f4c3' }
    },
    // Amber
    {
      light: { bg: '#fff8e1', border: '#ffc107', text: '#ff8f00' },
      dark: { bg: '#ff6f00', border: '#ffca28', text: '#fff176' }
    },
    // Brown
    {
      light: { bg: '#efebe9', border: '#795548', text: '#5d4037' },
      dark: { bg: '#3e2723', border: '#a1887f', text: '#bcaaa4' }
    },
  ], []);

  // Get consistent color for this list based on its ID
  const listColorSet = useMemo(() => {
    const hash = list.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return listColors[Math.abs(hash) % listColors.length];
  }, [list.id, listColors]);

  const cardIds = list.cards.map((card) => card.id);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardTitle.trim() === "") return;

    const newCard = {
      id: uuidv4(),
      title: newCardTitle,
      description: "",
    };
    dispatch({
      type: "ADD_CARD",
      payload: { listID: list.id, card: newCard },
    });
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  const handleEditTitle = (e) => {
    e.preventDefault();
    if (editedTitle.trim() === "") {
      setEditedTitle(list.title);
    } else {
      dispatch({
        type: "EDIT_LIST_TITLE",
        payload: { listID: list.id, newTitle: editedTitle.trim() },
      });
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = () => {
    if (window.confirm("Are you sure you want to delete this list and all its cards?")) {
      dispatch({
        type: "DELETE_LIST",
        payload: { listID: list.id },
      });
    }
  };

  return (
    <div ref={combineRefs} style={style} className="w-72 flex-shrink-0">
      <div
        className={`flex flex-col h-full rounded-lg shadow-lg border-2 transition-all duration-200 ${isDragging ? 'shadow-2xl' : 'hover:shadow-xl'}`}
        style={{
          backgroundColor: `var(--list-bg-${Math.abs(list.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) % listColors.length})`,
          borderColor: isDragging ?
            `var(--list-border-${Math.abs(list.id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0)) % listColors.length})` :
            'var(--color-border)'
        }}
      >
        {/* List Header */}
        <div
          className="p-4 flex justify-between items-center rounded-t-lg border-b"
          style={{
            backgroundColor: `var(--list-bg-${Math.abs(list.id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0)) % listColors.length})`,
            borderBottomColor: `var(--list-border-${Math.abs(list.id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0)) % listColors.length})`
          }}
        >
          {isEditingTitle ? (
            <form onSubmit={handleEditTitle} className="flex-1 mr-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleEditTitle}
                autoFocus
                className="w-full bg-input text-foreground border border-border rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </form>
          ) : (
            <h2
              {...attributes}
              {...listeners}
              className="font-bold cursor-grab flex-1"
              style={{
                color: `var(--list-text-${Math.abs(list.id.split('').reduce((a, b) => {
                  a = ((a << 5) - a) + b.charCodeAt(0);
                  return a & a;
                }, 0)) % listColors.length})`
              }}
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h2>
          )}

          <div className="flex items-center space-x-2">
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `var(--list-border-${Math.abs(list.id.split('').reduce((a, b) => {
                  a = ((a << 5) - a) + b.charCodeAt(0);
                  return a & a;
                }, 0)) % listColors.length})`,
                color: 'white'
              }}
            >
              {list.cards.length}
            </span>
            <button
              onClick={handleDeleteList}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="Delete list"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Cards Container */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-[100px] bg-card/50">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {list.cards.map((card) => (
              <Card key={card.id} card={card} listID={list.id} />
            ))}
          </SortableContext>
          {list.cards.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No cards yet</p>
            </div>
          )}
        </div>

        {/* Add Card Section */}
        <div
          className="p-3 rounded-b-lg border-t"
          style={{
            backgroundColor: `var(--list-bg-${Math.abs(list.id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0)) % listColors.length})`,
            borderTopColor: `var(--list-border-${Math.abs(list.id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0)) % listColors.length})`
          }}
        >
          {isAddingCard ? (
            <form onSubmit={handleAddCard} className="space-y-2">
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
                    backgroundColor: `var(--list-border-${Math.abs(list.id.split('').reduce((a, b) => {
                      a = ((a << 5) - a) + b.charCodeAt(0);
                      return a & a;
                    }, 0)) % listColors.length})`
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
            <button
              onClick={() => setIsAddingCard(true)}
              className="w-full p-3 text-left rounded-md border border-dashed border-muted hover:border-primary/50 bg-card hover:bg-card/80 text-card-foreground transition-colors"
            >
              + Add a card
            </button>
          )}
        </div>
      </div>

      {/* Inject CSS variables for this list's colors */}
      <style jsx>{`
        :root {
          --list-bg-${Math.abs(list.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) % listColors.length}: ${listColorSet.light.bg};
          --list-border-${Math.abs(list.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) % listColors.length}: ${listColorSet.light.border};
          --list-text-${Math.abs(list.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) % listColors.length}: ${listColorSet.light.text};
        }

        .dark {
          --list-bg-${Math.abs(list.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) % listColors.length}: ${listColorSet.dark.bg};
          --list-border-${Math.abs(list.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) % listColors.length}: ${listColorSet.dark.border};
          --list-text-${Math.abs(list.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) % listColors.length}: ${listColorSet.dark.text};
        }
      `}</style>
    </div>
  );
};

export default List;