import React, { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Circle,
  Bell,
  Clock,
  Check,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCropPlans, useCropTasks, useToggleCropTask } from '@/lib/api/planner'
import { useCreateTaskReminder } from '@/lib/api/cropCare'
import { Button } from '@/components/ui/Button'
import type { CropTask } from '@/lib/supabase/types'

export const CropCareTaskCalendar: React.FC = () => {
  const { user, farm } = useAuth()
  const { data: plans = [], isLoading: planLoading } = useCropPlans(farm?.id)
  const activePlan = plans[0]
  const { data: tasks = [], isLoading: tasksLoading } = useCropTasks(activePlan?.id)
  const toggleTask = useToggleCropTask()
  const createReminder = useCreateTaskReminder()

  const [reminderSetIds, setReminderSetIds] = useState<Record<string, boolean>>({})
  const [filterStage, setFilterStage] = useState<string>('all')

  const handleToggle = (taskId: string, currentDone: boolean) => {
    if (!activePlan?.id) return
    toggleTask.mutate({
      planId: activePlan.id,
      taskId,
      done: !currentDone,
    })
  }

  const handleSetReminder = async (task: CropTask) => {
    if (!user?.id) return
    await createReminder.mutateAsync({
      userId: user.id,
      taskTitle: task.title,
      dueDate: task.due_date,
    })
    setReminderSetIds((prev) => ({ ...prev, [task.id]: true }))
  }

  if (planLoading || tasksLoading) {
    return (
      <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--lime)] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs text-[var(--muted)]">Loading active crop calendar...</p>
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
        <div className="w-12 h-12 rounded-full bg-[var(--surface-alt)] text-[var(--forest)] flex items-center justify-center mx-auto border border-[var(--line)]">
          <Calendar className="w-6 h-6 text-[var(--forest)]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--ink)]">No Active Crop Plan Found</h3>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto mt-1">
            Start a crop plan in the Crop Planner to unlock an automated task calendar with sowing dates, irrigation cycles, and fertilizer reminders.
          </p>
        </div>
        <Link to="/plan">
          <Button variant="primary">
            Go to Crop Planner &rarr;
          </Button>
        </Link>
      </div>
    )
  }

  const stages = ['all', 'Pre-Sowing', 'Vegetative', 'Flowering / Tillering', 'Grain Filling', 'Harvest']
  const filteredTasks =
    filterStage === 'all'
      ? tasks
      : tasks.filter((t) => (t.stage || '').toLowerCase() === filterStage.toLowerCase())

  const completedCount = tasks.filter((t) => t.done).length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Active Crop Plan Header */}
      <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--lime)] text-[var(--ink)] text-xs font-bold uppercase tracking-wider mb-2">
            Active Cycle
          </div>
          <h3 className="text-2xl font-black text-[var(--ink)] tracking-tight">
            {activePlan.crop_id.toUpperCase()} Production Calendar
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Sown on {new Date(activePlan.sow_date).toLocaleDateString()} &bull; Farm: {farm?.state || 'Haryana'}, {farm?.district || 'Hisar'}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--line)] min-w-[200px] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[var(--ink)]">Field Progress</span>
            <span className="text-[var(--forest)]">{progressPercent}% Done</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--line)] overflow-hidden">
            <div
              className="h-full bg-[var(--forest)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-[var(--muted)] flex justify-between">
            <span>{completedCount} Completed</span>
            <span>{tasks.length - completedCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Stage Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterStage === stage
                ? 'bg-[var(--forest)] text-[var(--white)]'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            {stage === 'all' ? 'All Tasks' : stage}
          </button>
        ))}
      </div>

      {/* Task List / Calendar Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] text-sm">
            No tasks found for this stage.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isReminderSet = reminderSetIds[task.id]
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  task.done
                    ? 'border-[var(--line)] bg-[var(--surface-alt)] opacity-75'
                    : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--forest)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Tick-off Toggle Button */}
                  <button
                    onClick={() => handleToggle(task.id, task.done)}
                    className="mt-0.5 text-[var(--muted)] hover:text-[var(--forest)] cursor-pointer transition-colors"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--forest)] fill-[var(--lime)]" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold ${
                          task.done ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.stage && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--muted)]">
                          {task.stage}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-[var(--muted)] line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-[var(--forest)] font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action: Reminder / Status */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!task.done && (
                    <Button
                      variant={isReminderSet ? 'secondary' : 'secondary'}
                      size="sm"
                      onClick={() => handleSetReminder(task)}
                      disabled={isReminderSet || createReminder.isPending}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      {isReminderSet ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-[var(--forest)]" />
                          Reminder Set
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 mr-1 text-[var(--forest)]" />
                          Set Reminder
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
