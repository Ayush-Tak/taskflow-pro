import { useState } from "react";
import { useBoard } from "../contexts/BoardContext";
import Label from "./Label";

/**
 * Label Sidebar Component
 * Comprehensive label management and filtering interface
 * Provides both filtering capabilities and full CRUD operations for labels
 */
const LabelSidebar = ({ isOpen, onClose }) => {
  const { boardData, dispatch } = useBoard();
  const [activeTab, setActiveTab] = useState("filter"); // "filter" or "manage"
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingColor, setEditingColor] = useState("blue");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("blue");

  // Safety check for boardData
  if (!boardData || !boardData.labels) {
    return null;
  }

  // Available label colors
  const labelColors = [
    "blue", "green", "yellow", "orange", "red", "purple",
    "pink", "teal", "cyan", "indigo", "lime", "gray"
  ];

  // Handle filter toggle
  const handleFilterToggle = (labelId) => {
    console.log('Toggling filter for labelId:', labelId);
    console.log('Current activeFilters:', boardData.activeFilters);

    dispatch({
      type: "TOGGLE_LABEL_FILTER",
      payload: { labelId }
    });
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    dispatch({
      type: "CLEAR_ALL_FILTERS"
    });
  };

  // Handle edit label
  const handleEditLabel = (labelId, newText, newColor) => {
    dispatch({
      type: "EDIT_LABEL",
      payload: { labelId, text: newText, color: newColor }
    });
    setEditingLabelId(null);
    setEditingText("");
  };

  // Handle delete label
  const handleDeleteLabel = (labelId) => {
    if (window.confirm("Are you sure you want to delete this label? It will be removed from all cards.")) {
      dispatch({
        type: "DELETE_LABEL",
        payload: { labelId }
      });
    }
  };

  // Handle create label
  const handleCreateLabel = (e) => {
    e.preventDefault();
    if (newLabelText.trim()) {
      const newLabel = {
        id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: newLabelText.trim(),
        color: newLabelColor
      };

      dispatch({
        type: "ADD_LABEL",
        payload: newLabel
      });

      setNewLabelText("");
      setNewLabelColor("blue");
      setIsCreatingLabel(false);
    }
  };

  // Start editing a label
  const startEditing = (label) => {
    setEditingLabelId(label.id);
    setEditingText(label.text);
    setEditingColor(label.color);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingLabelId(null);
    setEditingText("");
    setEditingColor("blue");
  };

  // Get label usage count
  const getLabelUsageCount = (labelId) => {
    let count = 0;
    boardData.lists.forEach(list => {
      list.cards.forEach(card => {
        if (card.labelIds && card.labelIds.includes(labelId)) {
          count++;
        }
      });
    });
    return count;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border z-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Labels</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("filter")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "filter"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Filter
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "manage"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Manage
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-120px)] scrollbar-thin">
          {activeTab === "filter" ? (
            /* Filter Tab */
            <div className="space-y-4">
              {/* Active Filters Info */}
              {boardData.activeFilters && boardData.activeFilters.length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">
                      {boardData.activeFilters.length} filter{boardData.activeFilters.length > 1 ? 's' : ''} active
                    </span>
                    <button
                      onClick={handleClearAllFilters}
                      className="text-xs text-primary hover:text-primary/80 underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {boardData.activeFilters.map(filterId => {
                      const label = boardData.labels.find(l => l.id === filterId);
                      return label ? (
                        <Label
                          key={label.id}
                          label={label}
                          showRemove={true}
                          onRemove={() => handleFilterToggle(label.id)}
                          size="sm"
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Available Labels */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Click labels to filter cards
                </h3>
                {boardData.labels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">No labels created yet</p>
                    <button
                      onClick={() => setActiveTab("manage")}
                      className="text-primary hover:text-primary/80 underline"
                    >
                      Create your first label
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {boardData.labels.map(label => {
                      const isActive = boardData.activeFilters?.includes(label.id);
                      const usageCount = getLabelUsageCount(label.id);

                      return (
                        <div
                          key={label.id}
                          onClick={() => handleFilterToggle(label.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isActive
                              ? "bg-primary/10 border-primary shadow-sm"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Label label={label} />
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {usageCount} card{usageCount !== 1 ? 's' : ''}
                              </span>
                              {isActive && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Manage Tab */
            <div className="space-y-4">
              {/* Create New Label */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Create New Label</h3>
                {isCreatingLabel ? (
                  <form onSubmit={handleCreateLabel} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Label name..."
                      value={newLabelText}
                      onChange={(e) => setNewLabelText(e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      autoFocus
                    />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Choose Color:</label>
                      <div className="grid grid-cols-6 gap-3">
                        {labelColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewLabelColor(color)}
                            className={`w-10 h-10 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative label-bg-${color} ${
                              newLabelColor === color
                                ? "shadow-xl scale-110 ring-2 ring-primary label-border-selected"
                                : "hover:shadow-md label-border-unselected"
                            }`}
                            title={color.charAt(0).toUpperCase() + color.slice(1)}
                          >
                            {newLabelColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-lg font-bold drop-shadow-lg">✓</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                        Selected: <span className="capitalize font-bold text-foreground">{newLabelColor}</span>
                      </div>
                    </div>

                    {/* Label Preview */}
                    {newLabelText.trim() && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Preview:</label>
                        <div className="flex items-center">
                          <Label
                            label={{
                              id: "preview",
                              text: newLabelText,
                              color: newLabelColor
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                      >
                        Create Label
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingLabel(false);
                          setNewLabelText("");
                          setNewLabelColor("blue");
                        }}
                        className="px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingLabel(true)}
                    className="w-full py-2 border-2 border-dashed border-muted rounded-md text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    + Add new label
                  </button>
                )}
              </div>

              {/* Existing Labels */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Existing Labels ({boardData.labels.length})
                </h3>
                {boardData.labels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No labels created yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {boardData.labels.map(label => {
                      const usageCount = getLabelUsageCount(label.id);
                      const isEditing = editingLabelId === label.id;

                      return (
                        <div
                          key={label.id}
                          className="p-3 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full p-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                autoFocus
                              />
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Change Color:</label>
                                <div className="grid grid-cols-6 gap-3">
                                  {labelColors.map(color => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => setEditingColor(color)}
                                      className={`w-10 h-10 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative label-bg-${color} ${
                                        editingColor === color
                                          ? "shadow-xl scale-110 ring-2 ring-primary label-border-selected"
                                          : "hover:shadow-md label-border-unselected"
                                      }`}
                                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                                    >
                                      {editingColor === color && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-white text-lg font-bold drop-shadow-lg">✓</span>
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditLabel(label.id, editingText, editingColor)}
                                  className="flex-1 py-1 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Label label={label} />
                                <span className="text-xs text-muted-foreground">
                                  {usageCount} card{usageCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => startEditing(label)}
                                  className="p-1 rounded hover:bg-muted transition-colors"
                                  title="Edit label"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteLabel(label.id)}
                                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  title="Delete label"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LabelSidebar;
