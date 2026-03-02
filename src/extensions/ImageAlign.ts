import Image from "@tiptap/extension-image";

export type ImageAlignOptions = {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, unknown>;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageAlign: {
      setImageAlign: (align: "left" | "center" | "right") => ReturnType;
    };
  }
}

const ImageAlign = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-align": {
        default: "left",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-align") || "left",
        renderHTML: (attributes: Record<string, unknown>) => {
          const align = attributes["data-align"] as string;
          const style =
            align === "center"
              ? "display: block; margin-left: auto; margin-right: auto;"
              : align === "right"
                ? "display: block; margin-left: auto; margin-right: 0;"
                : "";

          return {
            "data-align": align,
            style: style || null,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align: "left" | "center" | "right") =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { "data-align": align });
        },
    };
  },
});

export default ImageAlign;
