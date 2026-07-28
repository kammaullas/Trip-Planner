import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, MapPin } from "lucide-react";
import { useTripStore, type Day, type Stop } from "../store/useTripStore";
import { TweakPanel } from "./TweakPanel";

const SortableStop = ({ stop, dayIndex }: { stop: Stop; dayIndex: number }) => {
  const { updateItinerary, session } = useTripStore();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (!session) return;
    const newItinerary = [...session.itinerary];
    newItinerary[dayIndex].stops = newItinerary[dayIndex].stops.filter((s) => s.id !== stop.id);
    updateItinerary(newItinerary);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm mb-3 group flex items-start space-x-3 transition-shadow hover:shadow-md"
    >
      <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 flex items-center space-x-2">
          <span>{stop.name}</span>
        </h4>
        <p className="text-sm text-slate-500 mt-1">{stop.description}</p>
      </div>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ItineraryView: React.FC = () => {
  const { session, updateItinerary } = useTripStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!session) return null;

  const handleDragEnd = (event: DragEndEvent, dayIndex: number) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newItinerary = [...session.itinerary];
      const stops = newItinerary[dayIndex].stops;
      
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over.id);

      newItinerary[dayIndex].stops = arrayMove(stops, oldIndex, newIndex);
      updateItinerary(newItinerary);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div
        className="h-48 md:h-64 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${session.destinationMeta.heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h2 className="text-3xl font-extrabold flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            <span>{session.destinationMeta.name}</span>
          </h2>
          <p className="text-slate-200 mt-1 opacity-80 text-sm">
            {session.itinerary.length} Days • {session.itinerary.reduce((acc, d) => acc + d.stops.length, 0)} Stops
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {session.itinerary.map((day: Day, dayIndex: number) => (
          <div key={day.dayNumber} className="mb-8">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-bold text-slate-800">Day {day.dayNumber}</h3>
            </div>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, dayIndex)}
            >
              <SortableContext items={day.stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {day.stops.map((stop) => (
                    <SortableStop key={stop.id} stop={stop} dayIndex={dayIndex} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ))}
        <div className="h-24"></div> {/* padding for tweak panel */}
      </div>
      
      <TweakPanel />
    </div>
  );
};
