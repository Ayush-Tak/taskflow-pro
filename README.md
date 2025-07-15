# 🚀 Trello Clone

A modern, responsive Trello clone built with React and featuring drag-and-drop functionality, theme switching, and beautiful randomized list colors.

## ✨ Features

### 🔥 Core Functionality
- **📝 Lists Management**: Create, edit, and delete lists with double-click editing
- **🎴 Cards Management**: Add, edit, and delete cards with detailed descriptions
- **🎯 Drag & Drop**: Seamless drag-and-drop for both cards and lists using @dnd-kit
- **💾 Local Storage**: Automatic data persistence across browser sessions

### 🎨 Design & UX
- **🌓 Dark/Light Theme**: Toggle between themes with smooth transitions
- **🌈 Randomized List Colors**: Each list gets a unique, professional color scheme
- **📱 Responsive Design**: Works beautifully on desktop and mobile devices
- **✨ Smooth Animations**: Polished hover effects and transitions

### 🎭 Theme System
- **Professional Color Palette**: Carefully chosen colors for optimal readability
- **CSS Variables**: Dynamic theming with custom properties
- **System Theme Detection**: Respects user's system preferences
- **Theme Persistence**: Remembers your theme choice

## 🛠️ Built With

- **React 18** - UI Framework
- **@dnd-kit** - Drag and drop functionality
- **Tailwind CSS** - Styling with custom theme system
- **Lucide React** - Beautiful icons
- **UUID** - Unique ID generation
- **LocalStorage** - Data persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ayush-Tak/trello-clone.git
cd trello-clone
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

## 🎮 How to Use

### Managing Lists
- **Add List**: Click "Add another list +" button
- **Edit List**: Double-click on any list title
- **Delete List**: Click the 🗑️ button (confirms before deletion)
- **Drag Lists**: Click and drag list headers to reorder

### Managing Cards
- **Add Card**: Click "+ Add a card" in any list
- **Edit Card**: Click on any card to open the edit modal
- **Delete Card**: Click "Delete" button in the card modal
- **Drag Cards**: Click and drag cards between lists or reorder within a list

### Theme Switching
- **Toggle Theme**: Click the sun/moon icon in the top-right corner
- **System Theme**: Automatically detects your system preference
- **Persistent**: Your theme choice is saved between sessions

## 🎨 Color System

The app features a sophisticated color system with:
- **12 Professional Color Schemes**: Each list gets a unique color combination
- **Light/Dark Variants**: Every color has optimized light and dark theme versions
- **Consistent Randomization**: Same list always gets the same color (based on ID hash)
- **Accessibility**: All colors meet WCAG contrast requirements

## 📁 Project Structure

```
src/
├── components/
│   ├── Board.jsx          # Main board component
│   ├── List.jsx           # List component with drag-drop
│   ├── Card.jsx           # Card component with modal
│   └── ThemeToggleButton.jsx # Theme switcher
├── contexts/
│   ├── BoardContext.jsx   # Global state management
│   └── ThemeContext.jsx   # Theme state management
├── index.css             # Global styles & CSS variables
├── App.jsx               # Root component
└── main.jsx              # Entry point
```

## 🔧 Technical Features

### State Management
- **React Context**: Global state for boards and theme
- **useReducer**: Complex state logic for board operations
- **Local Storage**: Automatic persistence with error handling

### Drag & Drop
- **@dnd-kit**: Modern, accessible drag-and-drop
- **Multi-type Dragging**: Support for both cards and lists
- **Visual Feedback**: Drag overlays and hover states
- **Touch Support**: Works on mobile devices

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Dynamic theming system
- **Responsive Design**: Mobile-first approach
- **Custom Animations**: Smooth transitions and hover effects

## 🎯 Future Enhancements

- [ ] Card labels and tags
- [ ] Due dates with calendar
- [ ] Search and filter functionality
- [ ] Card checklists
- [ ] File attachments
- [ ] Multiple boards
- [ ] Export/import functionality

## 📸 Screenshots

### Light Theme
![Light Theme](screenshots/light-theme.png)

### Dark Theme
![Dark Theme](screenshots/dark-theme.png)

### Drag & Drop
![Drag and Drop](screenshots/drag-drop.png)



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Inspired by [Trello](https://trello.com)
- Built with [Vite](https://vitejs.dev)
- Icons by [Lucide](https://lucide.dev)
- Drag & Drop by [@dnd-kit](https://dndkit.com)
- App icon by [Freepik](https://www.flaticon.com/authors/freepik) from [Flaticon](https://www.flaticon.com/)

---

**Made with ❤️ by Ayush-Tak**
