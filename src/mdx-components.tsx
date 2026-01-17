import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { MdxImage, ImageCountProvider } from "@/components/mdx-image";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: MdxImage,
    ...components,
  };
}

export { ImageCountProvider };
