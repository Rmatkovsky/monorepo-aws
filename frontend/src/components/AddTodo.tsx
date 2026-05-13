import { useState } from 'react';
import { useCreateTodo } from '../hooks/useTodos';

export default function AddTodo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { mutate, isPending } = useCreateTodo();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    mutate(
      { title: title.trim(), description: description.trim() || undefined },
      { onSuccess: () => { setTitle(''); setDescription(''); } }
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.heading}>New Todo</h2>
      <input
        style={styles.input}
        placeholder="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        style={{ ...styles.input, height: 72, resize: 'vertical' }}
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button style={styles.button} type="submit" disabled={isPending}>
        {isPending ? 'Adding…' : 'Add Todo'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 },
  heading: { margin: '0 0 4px', fontSize: 18 },
  input: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  },
  button: {
    padding: '9px 18px',
    borderRadius: 6,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};
