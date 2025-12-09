
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Player } from '../../types/queueTypes';
// Placeholder icon if needed, or just text

interface Props {
    player: Player;
    onRemove?: (id: string) => void;
}

export function SortablePlayer({ player, onRemove }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: player.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="queue-item"
        >
            <div className="queue-item-content">
                <span className="player-avatar-placeholder">{player.name.substring(0, 2).toUpperCase()}</span>
                <span className="player-name">{player.name}</span>
            </div>
            {onRemove && (
                <button
                    className="remove-btn"
                    onPointerDown={(e) => {
                        // Prevent drag start
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(player.id);
                    }}
                >
                    &times;
                </button>
            )}
        </div>
    );
}
