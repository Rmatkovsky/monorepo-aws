import { useState } from 'react';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import ImageUpload from './ImageUpload';
import type { Todo } from '../types';

interface Props {
  todo: Todo;
}

export default function TodoItem({ todo }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');

  const { mutate: update, isPending: saving } = useUpdateTodo();
  const { mutate: remove, isPending: deleting } = useDeleteTodo();

  function toggleComplete() {
    update({ id: todo.id, data: { completed: !todo.completed } });
  }

  function saveEdit() {
    update(
      { id: todo.id, data: { title: title.trim(), description: description.trim() || undefined } },
      { onSuccess: () => setEditing(false) }
    );
  }

  return (
    <div style={{ ...styles.card, opacity: todo.completed ? 0.65 : 1 }}>
      <div style={styles.header}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={toggleComplete}
          style={styles.checkbox}
        />
        {editing ? (
          <input
            style={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        ) : (
          <span
            style={{
              ...styles.title,
              textDecoration: todo.completed ? 'line-through' : 'none',
            }}
          >
            {todo.title}
          </span>
        )}
        <div style={styles.actions}>
          {editing ? (
            <>
              <button style={styles.saveBtn} onClick={saveEdit} disabled={saving}>
                {saving ? '…' : 'Save'}
              </button>
              <button style={styles.cancelBtn} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button style={styles.editBtn} onClick={() => setEditing(true)}>
                Edit
              </button>
              <button style={styles.deleteBtn} onClick={() => remove(todo.id)} disabled={deleting}>
                {deleting ? '…' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          style={styles.descInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
      ) : todo.description ? (
        <p style={styles.desc}>{todo.description}</p>
      ) : null}

      <ImageUpload todo={todo} />

      <span style={styles.date}>{new Date(todo.createdAt).toLocaleDateString()}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 16,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  checkbox: { width: 16, height: 16, flexShrink: 0, cursor: 'pointer' },
  title: { flex: 1, fontSize: 15, fontWeight: 500, color: '#111827' },
  titleInput: {
    flex: 1,
    padding: '4px 8px',
    borderRadius: 5,
    border: '1px solid #d1d5db',
    fontSize: 15,
    fontFamily: 'inherit',
  },
  desc: { margin: 0, fontSize: 13, color: '#6b7280', paddingLeft: 26 },
  descInput: {
    marginLeft: 26,
    padding: '6px 8px',
    borderRadius: 5,
    border: '1px solid #d1d5db',
    fontSize: 13,
    resize: 'vertical',
    height: 60,
    fontFamily: 'inherit',
  },
  date: { fontSize: 11, color: '#9ca3af', paddingLeft: 26 },
  actions: { display: 'flex', gap: 6, flexShrink: 0 },
  editBtn: {
    padding: '3px 10px', borderRadius: 5, border: '1px solid #d1d5db',
    background: '#fff', color: '#374151', fontSize: 12, cursor: 'pointer',
  },
  saveBtn: {
    padding: '3px 10px', borderRadius: 5, border: 'none',
    background: '#2563eb', color: '#fff', fontSize: 12, cursor: 'pointer',
  },
  cancelBtn: {
    padding: '3px 10px', borderRadius: 5, border: '1px solid #d1d5db',
    background: '#fff', color: '#374151', fontSize: 12, cursor: 'pointer',
  },
  deleteBtn: {
    padding: '3px 10px', borderRadius: 5, border: 'none',
    background: '#fee2e2', color: '#b91c1c', fontSize: 12, cursor: 'pointer',
  },
};
