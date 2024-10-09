import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';

export const JSONEditorComponent = <T extends object>({
  value,
  onChange,
}: {
  value: T;
  onChange: (value: T) => void;
}) => {
  const [editorEl, setEditorEl] = useState<HTMLDivElement | null>(null);

  const handleEditorRef = useCallback((element) => {
    console.log('set element');
    setEditorEl(element?.getBoundingClientRect());
  }, []);

  const editor = useMemo(() => {
    if (!editorEl) return;
    console.log('init', editorEl);
    // @ts-ignore
    return new window['JSONEditor'](editorEl, {});
  }, [editorEl]);

  useEffect(() => {
    editor?.set(value);
  }, [editor, value]);

  const onKeyEvent = useCallback(() => {
    onChange(editor.get());
  }, [editor, onChange]);

  useEffect(() => {
    editorEl?.addEventListener('keydown', onKeyEvent);

    return () => {
      editorEl?.removeEventListener('keydown', onKeyEvent);
    }
  }, [editorEl]);

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <div style={{ display: 'flex', flexGrow: 1 }} ref={handleEditorRef} />
    </Box>
  );
}