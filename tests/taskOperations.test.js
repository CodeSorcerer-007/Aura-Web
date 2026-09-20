import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskOperations } from '../src/hooks/useTaskOperations';

describe('useTaskOperations', () => {
  const createMockProps = (initialTasks = []) => {
    let tasks = initialTasks;
    const setTasks = vi.fn((updater) => {
      tasks = typeof updater === 'function' ? updater(tasks) : updater;
    });
    const setTemplates = vi.fn();
    const setGrove = vi.fn();
    const ui = {
      setToastMessage: vi.fn(),
      setTemplateSuggestion: vi.fn(),
      templateSuggestion: null
    };
    const playSoundEffect = vi.fn();

    return {
      getTasks: () => tasks,
      props: {
        tasks,
        setTasks,
        templates: [],
        setTemplates,
        setGrove,
        ui,
        playSoundEffect
      }
    };
  };

  it('correctly parses smart syntax (#category, @tag, !priority, ~spark, morning)', () => {
    const { props, getTasks } = createMockProps();
    const { result } = renderHook(() => useTaskOperations(props));

    act(() => {
      result.current.addTask('Design core engine architecture #Architecture @deepwork !urgent ~spark morning');
    });

    const tasks = getTasks();
    expect(tasks.length).toBe(1);
    const task = tasks[0];

    expect(task.text).toBe('Design core engine architecture');
    expect(task.category).toBe('Architecture');
    expect(task.tags).toContain('deepwork');
    expect(task.priority).toBe(3);
    expect(task.energy).toBe('spark');
    expect(task.timeOfDay).toBe('morning');
  });

  it('toggles task completion and records completion date', () => {
    const initialTask = {
      id: 'task-1',
      text: 'Test task',
      completed: false,
      completionDate: null
    };
    const { props, getTasks } = createMockProps([initialTask]);
    const { result } = renderHook(() => useTaskOperations(props));

    act(() => {
      result.current.toggleTask('task-1');
    });

    const tasks = getTasks();
    expect(tasks[0].completed).toBe(true);
    expect(tasks[0].completionDate).toBeDefined();
  });

  it('supports undoing a task deletion', () => {
    const initialTask = {
      id: 'task-undo',
      text: 'Task to be deleted and restored',
      completed: false
    };
    const { props, getTasks } = createMockProps([initialTask]);
    const { result } = renderHook(() => useTaskOperations(props));

    act(() => {
      result.current.deleteTask('task-undo');
    });
    expect(getTasks().length).toBe(0);

    // Verify undo was registered and trigger it
    expect(props.ui.setToastMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        onUndo: expect.any(Function)
      })
    );

    const toastCall = props.ui.setToastMessage.mock.calls.find(c => c[0].onUndo);
    act(() => {
      toastCall[0].onUndo();
    });

    expect(getTasks().length).toBe(1);
    expect(getTasks()[0].id).toBe('task-undo');
  });
});
