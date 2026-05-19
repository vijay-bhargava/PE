import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-with-table";
import QuillBetterTable from "quill-better-table";
import katex from "katex";
import "react-quill-with-table/dist/quill.snow.css";
import "quill-better-table/dist/quill-better-table.css";
import "katex/dist/katex.min.css";

Quill.register({ "modules/better-table": QuillBetterTable });
window.katex = katex;

export default function EditorQuillTemplate() {
  const reactQuillRef = useRef(null);
  const [editorState, setEditorState] = useState("");

  const insertTable = () => {
    const editor = reactQuillRef.current.getEditor();
    const tableModule = editor.getModule("better-table");
    tableModule.insertTable(3, 3);
  };

  const handleEditorStateChange = (val) => {
    setEditorState(val);
  };

  useEffect(() => {
    const editor = reactQuillRef.current.getEditor();
    const toolbar = editor.getModule("toolbar");
    if (toolbar) {
      toolbar.addHandler("table", insertTable);
    }
  }, []);

  const modules = useMemo(
    () => ({
      table: false,
      "better-table": {
        operationMenu: {
          items: {
            unmergeCells: {
              text: "Another unmerge cells name"
            }
          }
        }
      },
      keyboard: {
        bindings: QuillBetterTable.keyboardBindings
      },
      toolbar: [
        [
          "bold",
          "italic",
          "underline",
          "strike",
          { align: [] },
          { script: "sub" },
          { script: "super" },
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" }
        ],
        ["formula", "table"]
      ]
    }),
    []
  );

  return (
    <div>
      <ReactQuill
        ref={reactQuillRef}
        modules={modules}
        theme="snow"
        onChange={handleEditorStateChange}
      />
    </div>
  );
}
