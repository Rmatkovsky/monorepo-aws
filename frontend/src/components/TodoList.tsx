import { useTodos } from '../hooks/useTodos';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { data: todos, isLoading, isError } = useTodos();

  if (isLoading) return <p style={{ color: '#6b7280' }}>Loading…</p>;
  if (isError) return <p style={{ color: '#b91c1c' }}>Failed to load todos.</p>;
  if (!todos?.length) return <p style={{ color: '#9ca3af' }}>No todos yet. Add one above!</p>;

  const pending = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <h3 style={styles.sectionHeading}>Active ({pending.length})</h3>
        <div style={styles.list}>
          {pending.map((t) => (
            <TodoItem key={t.id} todo={t} />
          ))}
          {!pending.length && <p style={{ color: '#9ca3af', fontSize: 13 }}>All done!</p>}
        </div>
      </section>

      {done.length > 0 && (
        <section>
          <h3 style={styles.sectionHeading}>Completed ({done.length})</h3>
          <div style={styles.list}>
            {done.map((t) => (
              <TodoItem key={t.id} todo={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionHeading: { margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: '#374151' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
};
