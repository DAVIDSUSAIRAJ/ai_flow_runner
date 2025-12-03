# AIFlow Runner

A mini n8n-style workflow runner for text processing, built with React 17, ReactFlow v11, and Zustand.

## Features

- **Visual Flow Canvas**: ReactFlow-powered canvas showing processing nodes
- **Drag & Drop Ordering**: Reorder execution steps via drag-and-drop in the side panel
- **Real-time Status**: Visual indicators showing idle/running/done/error states
- **Text Processing Pipeline**: Chain multiple text processing steps together

## Tech Stack

- React 17
- Vite
- TypeScript
- ReactFlow v11
- Zustand (state management)
- react-dnd (drag-and-drop)
- TailwindCSS

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for production

```bash
npm run build
```

## Usage

1. **Enter Text**: Type your input text in the left panel
2. **Arrange Steps**: Drag steps in the right panel to set execution order
3. **Remove Steps**: Click the delete icon on any step to remove it
4. **Run Flow**: Click "Run Flow" to process your text through all steps
5. **Monitor Progress**: Watch the status badges update as each step runs

## Available Processing Steps

- **Clean Text**: Remove noise, fix typos, normalize formatting
- **Detect Emotion**: Analyze emotional tone and sentiment
- **Categorize**: Classify text into categories
- **Summarize**: Generate a concise summary

## Project Structure

```
src/
├── components/
│   ├── TextInputPanel.tsx    # Left panel with input textarea
│   ├── FlowCanvas.tsx        # Center ReactFlow canvas
│   ├── StepNode.tsx          # Custom node for ReactFlow
│   ├── ExecutionOrderPanel.tsx # Right panel with step ordering
│   └── DraggableStepItem.tsx # Draggable step in the order list
├── store/
│   └── flowStore.ts          # Zustand state management
├── types.ts                   # TypeScript types
├── App.tsx                    # Main app layout
├── main.tsx                   # Entry point
└── index.css                  # Global styles + Tailwind
```

