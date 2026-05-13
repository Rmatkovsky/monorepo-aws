import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';

export default function App() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Todos</h1>
      </header>
      <main style={styles.main}>
        <AddTodo />
        <TodoList />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fff',
  },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' },
  main: { maxWidth: 640, margin: '32px auto', padding: '0 16px' },
};
