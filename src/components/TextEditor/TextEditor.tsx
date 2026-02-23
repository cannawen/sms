import React, { useLayoutEffect, useRef } from "react";
import cn from "classnames";
import { TextEditorProps } from ".";
import { TextStyles } from "../TextEditorOptions";
import { updateStyles } from "./utils";

const initialStyles: TextStyles = {
  "dark:bg-white": true,
  "dark:text-black": true,
  "font-mono": true,
  "scale-w-1": true,
};

/**
 * Main editor component with textarea and options
 */
function TextEditor({ id }: TextEditorProps) {
  const [textOptionStyles, setTextStyles] =
    React.useState<TextStyles>(initialStyles);
  const [containerStyles, setContainerStyles] = React.useState<TextStyles>({});
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const defaultText = "";
  const placeholderText = "Take a photo of a cat"


  useLayoutEffect(() => {
    if (textAreaRef.current) {
      const { height } = textAreaRef.current.getBoundingClientRect();
      setContainerStyles((prev) => {
        const oldStyleKey = Object.keys(prev).filter((key) =>
          key.startsWith("h-")
        );
        if (oldStyleKey.length > 0) {
          delete prev[oldStyleKey[0]];
        }
        return {
          ...prev,
          [`h-[${height}px]`]: true,
        };
      });
    }
  }, [textOptionStyles]);

  function onFormChange(e: React.FormEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    const targetId = target.id.slice(id.length + 1); // remove editor id prefix
    const input = target as HTMLInputElement;

    updateStyles(targetId, input, setTextStyles);
  }

  return (
    <section onChange={onFormChange}>
      <div className="md:flex md:gap-2">
        <div>
          <p
            className="block font-medium align-left mb-2"
            id={`${id}-text-label`}
          >
            Print a new mission:
          </p>
          <div className={cn("w-[420px] mb-4", containerStyles)}>
            <textarea
              role="textbox"
              id={`${id}-text`}
              name={`${id}-text`}
              className={cn(
                "resize-none break-all border border-gray-300 rounded-md p-1",
                textOptionStyles
              )}
              defaultValue={defaultText}
              placeholder={placeholderText}
              ref={textAreaRef}
            ></textarea>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TextEditor;
