"use client";

import React, { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ts_task from "./interfaces/ts_task";

const TaskItem = React.memo(
  ({
    task,
    level = 0,
    parentId = null,
    onEditStart,
    onEditChange,
    onEditSave,
    onEditCancel,
    onDelete,
    onAddChild,
    onAddSibling,
    editingId,
    editValue,
    inputRef,
  }: {
    task: ts_task;
    level?: number;
    parentId: string | null;
    onEditStart: (id: string, title: string) => void;
    onEditChange: (value: string) => void;
    onEditSave: () => void;
    onEditCancel: () => void;
    onDelete: (id: string) => void;
    onAddChild: (id: string) => void;
    onAddSibling: (parentId: string | null, targetId: string) => void;
    editingId: string | null;
    editValue: string;
    inputRef: any; // React.RefObject<HTMLInputElement>;
  }) => {
    const indent = level * 20;
    const isEditing = editingId === task.id;

    return (
      <div className="mb-2" style={{ marginLeft: indent }}>
        <div className="flex items-center gap-2 p-2 bg-white rounded border shadow-sm">
          {isEditing ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                onBlur={onEditSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onEditSave();
                  if (e.key === "Escape") onEditCancel();
                }}
                className="px-2 py-1 border rounded w-64 text-sm"
              />
              <button
                onClick={onEditSave}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✅
              </button>
              <button
                onClick={onEditCancel}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                ❌
              </button>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-800 min-w-0 truncate">
                {task.title}
              </span>
              <button
                onClick={() => onEditStart(task.id, task.title)}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                title="Редактировать название"
              >
                ✏️
              </button>
              <button
                onClick={() => onAddChild(task.id)}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                title="Добавить подзадачу"
              >
                ➕ Вглубь
              </button>
              <button
                onClick={() => onAddSibling(parentId, task.id)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                title="Добавить после этой задачи"
              >
                ➕ Вниз
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                title="Удалить задачу"
              >
                🗑️
              </button>
            </>
          )}
        </div>
        {!isEditing &&
          task.children.map((child) => (
            <TaskItem
              key={child.id}
              task={child}
              level={level + 1}
              parentId={task.id}
              onEditStart={onEditStart}
              onEditChange={onEditChange}
              onEditSave={onEditSave}
              onEditCancel={onEditCancel}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onAddSibling={onAddSibling}
              editingId={editingId}
              editValue={editValue}
              inputRef={inputRef}
            />
          ))}
      </div>
    );
  }
);

export default function TaskTree(props: { config: ts_task[] }) {
  const [tasks, setTasks] = useState<ts_task[]>(props.config);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback((id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, []);

  const handleEditChange = useCallback((value: string) => {
    setEditValue(value);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      setEditValue("");
      return;
    }

    const updateRecursively = (tasks: ts_task[]): ts_task[] => {
      return tasks.map((task) => {
        if (task.id === editingId) {
          return { ...task, title: editValue };
        }
        return { ...task, children: updateRecursively(task.children) };
      });
    };

    setTasks((prev) => updateRecursively(prev));
    setEditingId(null);
    setEditValue("");
  }, [editingId, editValue]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const removeTask = (tasks: ts_task[], taskIdToRemove: string): ts_task[] => {
    return tasks
      .filter((task) => task.id !== taskIdToRemove)
      .map((task) => ({
        ...task,
        children: removeTask(task.children, taskIdToRemove),
      }));
  };

  const handleDelete = useCallback(
    (taskId: string) => {
      if (confirm("Удалить задачу и все подзадачи?")) {
        setTasks((prev) => removeTask(prev, taskId));
        if (editingId === taskId) {
          cancelEdit();
        }
      }
    },
    [editingId, cancelEdit]
  );

  const addChild = useCallback((parentId: string) => {
    const newTask: ts_task = {
      id: uuidv4(),
      title: "Новая подзадача",
      children: [],
    };
    const addRec = (tasks: ts_task[]): ts_task[] => {
      return tasks.map((task) => {
        if (task.id === parentId) {
          return { ...task, children: [...task.children, newTask] };
        }
        return { ...task, children: addRec(task.children) };
      });
    };
    setTasks((prev) => addRec(prev));
  }, []);

  const addSibling = useCallback(
    (parentId: string | null, targetId: string) => {
      const newTask: ts_task = {
        id: uuidv4(),
        title: "Новая задача",
        children: [],
      };

      if (parentId === null) {
        setTasks((prev) => [...prev, newTask]);
        return;
      }

      const addSiblingRec = (tasks: ts_task[]): ts_task[] => {
        return tasks.map((task) => {
          if (task.id === parentId) {
            const index = task.children.findIndex((t) => t.id === targetId);
            const newChildren = [...task.children];
            newChildren.splice(index + 1, 0, newTask);
            return { ...task, children: newChildren };
          }
          return { ...task, children: addSiblingRec(task.children) };
        });
      };

      setTasks((prev) => addSiblingRec(prev));
    },
    []
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tasks</h1>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            parentId={null}
            onEditStart={startEditing}
            onEditChange={handleEditChange}
            onEditSave={saveEdit}
            onEditCancel={cancelEdit}
            onDelete={handleDelete}
            onAddChild={addChild}
            onAddSibling={addSibling}
            editingId={editingId}
            editValue={editValue}
            inputRef={inputRef}
          />
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => addSibling(null, "")}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          ➕ Добавить корневую задачу
        </button>
        <div
          style={{
            marginTop: 10,
          }}
        >
          <button
            onClick={() => {
              console.log(tasks);

              fetch("/api/save-config", {
                method: "post",
                body: JSON.stringify(tasks),
              });
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            ➕ Сохранить конфигурацию
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
          }}
        >
          <h3>vds client</h3>
          <VdsCLient />
        </div>
        {/* <pre>{JSON.stringify(tasks, null, 2)}</pre> */}
      </div>
    </div>
  );
}

function VdsCLient() {
  const [stateIn, setStateIn] = useState('ls');
  const [stateOut, setStateOut] = useState("");
  return (
    <>
      <textarea
        onChange={(e) => {
          setStateIn(e.target.value);
          return e;
        }}
        style={{ border: "1px solid" }}
        name=""
        id=""
        value={stateIn}
      ></textarea>
      <button
        onClick={() => {
          fetch("/api/vds/execute", {
            method: "post",
            body: JSON.stringify({
              command: stateIn,
            }),
          })
            .then((x) => x.json())
            .then((x) => setStateOut(x.res.result))
            .catch((error) => console.error({ error }));
        }}
        style={{ padding: 10, background: "yellow" }}
      >
        go
      </button>
      {/* <h1>stateOut</h1> */}
      <pre>{stateOut}</pre>
    </>
  );
}
