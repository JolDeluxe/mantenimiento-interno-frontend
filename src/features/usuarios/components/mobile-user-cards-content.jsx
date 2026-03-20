import { Icon, Skeleton } from '@/components/ui/z_index';
import { UserCard } from './user-card';
import { cn } from '@/utils/cn';

const SKELETON_COUNT = 5;

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
            <Skeleton className="h-5 w-14 rounded-md shrink-0" />
        </div>
        <div className="space-y-2 mb-3 ml-1">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
    </div>
);

export const MobileUserCardsContent = ({ users, loading, currentUser, hasPaginator, onEdit, onToggleStatus, onViewDetail }) => {
    const bottomPadding = hasPaginator ? 'pb-56' : 'pb-44';

    if (loading) {
        return (
            <div className={cn('flex flex-col gap-3 px-1 pt-1', bottomPadding)}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!users.length) {
        return (
            <div className="flex flex-col items-center justify-center h-44 gap-3 text-slate-400">
                <Icon name="search_off" size="xl" />
                <p className="text-sm font-medium">Sin resultados</p>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-3 px-1 pt-1', bottomPadding)}>
            {users.map((row) => (
                <UserCard
                    key={row.id}
                    usuario={row}
                    currentUser={currentUser}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onViewDetail={onViewDetail}
                />
            ))}
        </div>
    );
};