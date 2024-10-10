import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import isEqual = require('lodash/isEqual');
import cloneDeep = require('lodash/cloneDeep');

export default function JSONEditorReact(props) {
  // copy all properties into options for the editor
  // (except the properties for the JSONEditorReact component itself)
  const options = Object.assign({}, props);
  delete options.json;
  delete options.text;

  options.onChange = () => {
    if (props.onChange) {
      props.onChange(jsoneditor.current.get());
    }
  }

  const jsoneditor = useRef(null);
  const container = useRef(null);

  useEffect(() => {
    if (container && container.current) {
      jsoneditor.current = new window['JSONEditor'](container.current, options);
      if ('json' in props) {
        jsoneditor.current.set(props.json);
      }
      if ('text' in props) {
        jsoneditor.current.setText(props.text);
      }
    }
  }, [container, options, props]);

  useEffect(() => {
    if (container && container.current) {
      let schema = cloneDeep(props.schema);
      let schemaRefs = cloneDeep(props.schemaRefs);
      if ('json' in props) {
        jsoneditor.current.update(props.json);
      }

      if ('text' in props) {
        jsoneditor.current.updateText(props.text);
      }

      if ('mode' in props) {
        jsoneditor.current.setMode(props.mode);
      }

      // store a clone of the schema to keep track on when it actually changes.
      // (When using a PureComponent all of this would be redundant)
      const schemaChanged = !isEqual(props.schema, schema);
      const schemaRefsChanged = !isEqual(props.schemaRefs, schemaRefs);
      if (schemaChanged || schemaRefsChanged) {
        schema = cloneDeep(props.schema);
        schemaRefs = cloneDeep(props.schemaRefs);
        jsoneditor.current.setSchema(props.schema, props.schemaRefs);
      }
    }
    return function cleanup() {
      if (jsoneditor.current) {
        jsoneditor.current.destroy();
      }
    };
  }, [props.json, props.text, props.mode, props.schema, props.schemaRefs]);

  return <div style={{ width: '100%', height: '100%' }} ref={container} />;
}
