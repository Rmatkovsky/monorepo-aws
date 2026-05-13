import { useRef } from 'react';
import { useUploadImage, useDeleteImage } from '../hooks/useTodos';
import type { Todo } from '../types';

interface Props {
  todo: Todo;
}

export default function ImageUpload({ todo }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: upload, isPending: uploading } = useUploadImage();
  const { mutate: removeImg, isPending: deleting } = useDeleteImage();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload({ id: todo.id, file });
    e.target.value = '';
  }

  if (todo.imageUrl) {
    return (
      <div style={styles.wrapper}>
        <img src={todo.imageUrl} alt="todo" style={styles.img} />
        {todo.imageStatus === 'PENDING' && (
          <span style={styles.badge}>Processing…</span>
        )}
        {todo.imageStatus === 'FAILED' && (
          <span style={{ ...styles.badge, background: '#fee2e2', color: '#b91c1c' }}>Failed</span>
        )}
        <button
          style={styles.removeBtn}
          onClick={() => removeImg(todo.id)}
          disabled={deleting}
        >
          {deleting ? '…' : 'Remove image'}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        style={styles.uploadBtn}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading…' : 'Add image'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  img: { width: '100%', maxWidth: 280, borderRadius: 6, objectFit: 'cover', maxHeight: 180 },
  badge: {
    display: 'inline-block',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 12,
    background: '#fef9c3',
    color: '#854d0e',
    alignSelf: 'flex-start',
  },
  uploadBtn: {
    padding: '5px 12px',
    borderRadius: 6,
    border: '1px dashed #9ca3af',
    background: 'transparent',
    color: '#374151',
    fontSize: 12,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  removeBtn: {
    padding: '3px 10px',
    borderRadius: 6,
    border: 'none',
    background: '#fee2e2',
    color: '#b91c1c',
    fontSize: 12,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};
