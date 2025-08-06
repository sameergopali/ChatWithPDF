import { DragEvent, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

import { Card, CardHeader } from '@/components/ui/card';

const KanbanBoard = () => {
  const [boardOrder, setBoardOrder] = useState([
    'Didn\'t understand',
    'Theory',
    'Doing',
    'To do'
  ]);
  
  const [boards, setBoards] = useState<{ [key: string]: string[] }>({
    'Didn\'t understand': [
      'subarray product less than k',
      'minimum-size-subarray-sum',
      '219. contains duplicate II'
    ],
    'Theory': [
      'Loop invariant in two pointers',
      'Sliding windows',
      'cycle detection algorithm',
      'loop invariant for sliding window',
      'loop invariant for dynamic sliding window',
      'fizz buzz'
    ],
    'Doing': [],
    'To do': ['Merge sorted lists']
  });
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedBoard, setDraggedBoard] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);

  const addNewColumn = () => {
    const newColumnName = prompt('Enter new column name:');
    if (newColumnName && !boards[newColumnName]) {
      setBoards(prev => ({
        ...prev,
        [newColumnName]: []
      }));
      setBoardOrder(prev => [...prev, newColumnName]);
    }
  };

  const deleteColumn = (boardName: string) => {
    if (confirm(`Are you sure you want to delete "${boardName}" and all its cards?`)) {
      setBoards(prev => {
        const newBoards = { ...prev };
        delete newBoards[boardName];
        return newBoards;
      });
      setBoardOrder(prev => prev.filter(name => name !== boardName));
    }
  };

  const handleCardDragStart = (item: string, boardName: string, e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDraggedItem(item);
    setDraggedBoard(boardName);
  };

  const handleColumnDragStart = (boardName: string, e: DragEvent<HTMLDivElement>) => {
    setDraggedColumn(boardName);
    setIsDraggingColumn(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragOver = (e: DragEvent<HTMLDivElement>, targetBoardName: string) => {
    e.preventDefault();
    if (!isDraggingColumn || draggedColumn === targetBoardName || draggedColumn === null) return;

    const draggedIdx = boardOrder.indexOf(draggedColumn);
    const targetIdx = boardOrder.indexOf(targetBoardName);
    
    if (draggedIdx !== targetIdx) {
      const newOrder = [...boardOrder];
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedColumn);
      setBoardOrder(newOrder);
    }
  };

  const handleDragOver = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  };

  const handleDrop = (targetBoard: string | null, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDraggingColumn) {
      setIsDraggingColumn(false);
      setDraggedColumn(null);
      return;
    }

    if (draggedItem && draggedBoard !== targetBoard) {
      setBoards(prev => {
        const newBoards = { ...prev };
        if (draggedBoard && targetBoard) {
          newBoards[draggedBoard] = prev[draggedBoard].filter((item: any) => item !== draggedItem);
          newBoards[targetBoard] = [...prev[targetBoard], draggedItem];
        }
        return newBoards;
      });
    }
    setDraggedItem(null);
    setDraggedBoard(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedBoard(null);
    setDraggedColumn(null);
    setIsDraggingColumn(false);
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 overflow-x-auto min-h-[600px]">
        {boardOrder.map((boardName) => (
          <div
            key={boardName}
            className="flex-shrink-0 w-72"
            draggable
            onDragStart={(e) => handleColumnDragStart(boardName, e)}
            onDragOver={(e) => handleColumnDragOver(e, boardName)}
            onDrop={(e) => handleDrop(boardName, e)}
            onDragEnd={handleDragEnd}
          >
            <Card className={`bg-gray-100 p-4 h-full ${draggedColumn === boardName ? 'opacity-50' : ''}`}>
              <CardHeader className="font-bold text-lg pb-4 cursor-move flex flex-row justify-between items-center">
                <span>{boardName}</span>
                <button 
                  onClick={() => deleteColumn(boardName)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </CardHeader>
              <div className="flex flex-col gap-2">
                {boards[boardName].map((item, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleCardDragStart(item, boardName, e)}
                    className="bg-white p-3 rounded shadow cursor-move hover:bg-gray-50 transition-colors"
                  >
                    {item}
                  </div>
                ))}
                <button 
                  className="mt-2 p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors text-left"
                  onClick={() => {
                    const newItem = prompt('Enter new card title:');
                    if (newItem) {
                      setBoards(prev => ({
                        ...prev,
                        [boardName]: [...prev[boardName], newItem]
                      }));
                    }
                  }}
                >
                  + Add a card
                </button>
              </div>
            </Card>
          </div>
        ))}
        <div className="flex-shrink-0 w-72">
          <button 
            onClick={addNewColumn}
            className="w-full h-full min-h-[100px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-gray-600"
          >
            <Plus size={20} />
            Add new column
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
