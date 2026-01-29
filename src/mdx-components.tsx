import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "./components/mdx/mermaid";
import { SubscribeModal } from "@/components/subscribe-modal";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(defaultMdxComponents as MDXComponents),
    Mermaid,
    SubscribeModal,
    ...components,
  };
}
