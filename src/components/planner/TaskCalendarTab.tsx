import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Droplets,
  Layers,
  ShieldAlert,
  Sprout,
  Package,
} from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import { useCropTasks, useToggleCropTask } from '@/lib/api/planner'
import type { CropPlan, CropTask } from '@/lib/supabase/types'

interface TaskCalendarTabProps {
  plan: CropPlan
  cropName: string
}

export const TaskCalendarTab: React.FC<TaskCalendarTabProps> = ({
  plan,
  cropName,
}) => {
  const { data: tasks = [] } = useCropTasks(plan.id)
  const toggleTaskMutation = useToggleCropTask()

  const completedCount = tasks.filter((t) => t.done).length
  const totalCount = tasks.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'irrigation':
        return <Droplets className="w-4 h-4 text-forest" />
      case 'fertilizer':
        return <Layers className="w-4 h-4 text-forest" />
      case 'pest_check':
        return <ShieldAlert className="w-4 h-4 text-warning" />
      case 'harvest':
        return <Package className="w-4 h-4 text-forest" />
      case 'sowing':
      default:
        return <Sprout className="w-4 h-4 text-forest" />
    }
  }

  const handleToggle = (task: CropTask) => {
    toggleTaskMutation.mutate({
      planId: plan.id,
      taskId: task.id,
      done: !task.done,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Plan Header Card */}
      <Card variant="surface" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="lime" dot>Active Crop Plan</Badge>
            <span className="text-xs text-muted">ID: {plan.id}</span>
          </div>
          <h3 className="text-xl font-bold text-ink">
            {cropName} Agronomic Calendar
          </h3>
          <p className="text-xs text-muted flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-muted" />
            <span>Sowing / Initiation Date: {plan.sow_date}</span>
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex flex-col sm:items-end gap-1.5 border-t sm:border-t-0 border-line pt-3 sm:pt-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-ink">
              {completedCount} of {totalCount} Tasks Done
            </span>
            <span className="text-xs font-semibold text-forest">({progressPct}%)</span>
          </div>
          <div className="w-40 h-2 rounded-pill bg-surface-alt border border-line overflow-hidden">
            <div
              className="h-full bg-lime transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Dated Task Timeline */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted px-1">
          Chronological Field Tasks ({tasks.length})
        </span>

        {tasks.map((task) => {
          const dueDateFormatted = new Date(task.due_date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })

          return (
            <Card
              key={task.id}
              variant="surface"
              className={`p-4 transition-all flex items-start justify-between gap-4 ${
                task.done ? 'opacity-70 bg-surface-alt/70' : 'hover:border-forest/40'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Interactive Checkbox Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(task)}
                  className="mt-0.5 text-ink hover:text-forest transition-colors focus:outline-none"
                  title={task.done ? 'Mark as pending' : 'Mark as completed'}
                >
                  {task.done ? (
                    <CheckCircle2 className="w-5 h-5 text-forest" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted hover:text-forest" />
                  )}
                </button>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-forest bg-white px-2.5 py-0.5 rounded-pill border border-line flex items-center gap-1.5">
                      <CalendarIcon className="w-3 h-3 text-forest" />
                      <span>{dueDateFormatted}</span>
                    </span>

                    {task.stage && (
                      <Badge variant="forest">{task.stage}</Badge>
                    )}

                    {task.category && (
                      <span className="text-[11px] text-muted flex items-center gap-1">
                        {getCategoryIcon(task.category)}
                        <span className="capitalize">{task.category.replace('_', ' ')}</span>
                      </span>
                    )}
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-bold ${
                      task.done ? 'line-through text-muted' : 'text-ink'
                    }`}
                  >
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-xs text-muted leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`text-[11px] px-2 py-0.5 rounded-pill border font-semibold shrink-0 ${
                  task.done
                    ? 'bg-lime text-ink border-lime'
                    : 'bg-white text-muted border-line'
                }`}
              >
                {task.done ? 'Completed' : 'Upcoming'}
              </span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
