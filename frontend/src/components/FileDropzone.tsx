import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import './FileDropzone.css';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  selectedFileName?: string | null;
}

export function FileDropzone({ onFileSelected, disabled = false, selectedFileName }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) onFileSelected(file);
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onFileSelected(file);
    event.target.value = '';
  }

  const classNames = [
    'file-dropzone',
    isDragOver && 'file-dropzone--active',
    disabled && 'file-dropzone--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        hidden
        disabled={disabled}
        onChange={handleInputChange}
      />
      <p className="file-dropzone__title">
        {selectedFileName ?? 'Drag & drop a document here, or click to browse'}
      </p>
      <p className="file-dropzone__hint">PDF or text files</p>
    </div>
  );
}
