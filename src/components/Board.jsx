import { useBoard } from "../contexts/BoardContext";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import List from "./List";
import Card from "./Card";
import { ThemeToggleButton } from "./ThemeToggleButton";

const Board = () => {
  const { boardData, dispatch } = useBoard();
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 250,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const { id } = active;
    const isList = boardData.some((list) => list.id === id);
    if (isList) {
      const list = boardData.find((list) => list.id === id);
      setActiveItem({ type: "List", data: list });
      return;
    }
    let card = null;
    let listID = null;
    boardData.forEach((list) => {
      const found = list.cards.find((c) => c.id === id);
      if (found) {
        card = found;
        listID = list.id;
      }
    });
    if (card) {
      setActiveItem({ type: "Card", data: card, listID });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const isListDrag = activeItem?.type === "List";
    if (isListDrag) {
      const oldIndex = boardData.findIndex((list) => list.id === activeId);
      const newIndex = boardData.findIndex((list) => list.id === overId);
      if (oldIndex !== newIndex) {
        dispatch({
          type: "MOVE_LIST",
          payload: { sourceIndex: oldIndex, destinationIndex: newIndex },
        });
      }
      return;
    }
    const sourceList = boardData.find((list) =>
      list.cards.some((card) => card.id === activeId)
    );
    const destList = boardData.find(
      (list) =>
        list.id === overId || list.cards.some((card) => card.id === overId)
    );
    if (!sourceList || !destList) return;
    const isDroppingOnCard = destList.cards.some((card) => card.id === overId);
    dispatch({
      type: "MOVE_CARD",
      payload: {
        cardId: activeId,
        sourceListId: sourceList.id,
        destListId: destList.id,
        overCardId: isDroppingOnCard ? overId : null,
      },
    });
  };

  const handleAddList = (e) => {
    e.preventDefault();
    if (newListTitle.trim() === "") return;
    dispatch({
      type: "ADD_LIST",
      payload: { id: uuidv4(), title: newListTitle, cards: [] },
    });
    setNewListTitle("");
    setIsAddingList(false);
  };

  const handleCancelListAdd = () => {
    setNewListTitle("");
    setIsAddingList(false);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-screen bg-background text-foreground">
        {/* Header with subtle secondary background */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-secondary/30 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between h-full px-6">
            <h1 className="text-xl font-bold text-primary">Trello Clone</h1>
            <ThemeToggleButton />
          </div>
        </div>

        <div className="pt-16 h-full flex items-start overflow-x-auto p-4 sm:p-6 space-x-4 sm:space-x-6 min-w-0">
          <SortableContext
            items={boardData.map((list) => list.id)}
            strategy={horizontalListSortingStrategy}
          >
            {boardData.map((list) => (
              <List key={list.id} list={list} />
            ))}
          </SortableContext>

          {isAddingList ? (
            <form
              onSubmit={handleAddList}
              className="w-72 flex-shrink-0 p-4 bg-secondary border-2 border-dashed border-primary/50 rounded-lg space-y-2 shadow-lg"
            >
              <input
                type="text"
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                autoFocus
                className="w-full p-3 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Add List
                </button>
                <button
                  type="button"
                  onClick={handleCancelListAdd}
                  className="w-12 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  ❌
                </button>
              </div>
            </form>
          ) : (
            <div
              onClick={() => setIsAddingList(true)}
              className="w-72 flex-shrink-0 p-4 bg-secondary/50 border-2 border-dashed border-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/80 hover:border-primary/50 transition-all duration-200 group"
            >
              <span className="font-bold text-muted-foreground group-hover:text-primary transition-colors">
                Add another list +
              </span>
            </div>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeItem?.type === "Card" ? (
          <Card
            card={activeItem.data}
            wrapperClassName="transform rotate-3 shadow-2xl border-2 border-primary/50"
          />
        ) : null}
        {activeItem?.type === "List" ? (
          <div className="w-72 h-full opacity-90">
            <List list={activeItem.data} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
