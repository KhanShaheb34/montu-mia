"use client";

import Image from "next/image";
import {
  type ImgHTMLAttributes,
  createContext,
  useContext,
  useRef,
} from "react";

interface ImageCountContextType {
  getNextIndex: () => number;
}

const ImageCountContext = createContext<ImageCountContextType | null>(null);

/**
 * Provider to track image indices within a page
 * This ensures proper priority loading for the first image
 */
export function ImageCountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const countRef = useRef(0);

  const getNextIndex = () => {
    countRef.current += 1;
    return countRef.current;
  };

  return (
    <ImageCountContext.Provider value={{ getNextIndex }}>
      {children}
    </ImageCountContext.Provider>
  );
}

export function MdxImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const context = useContext(ImageCountContext);

  // Get the next index from context, or default to 0 if context is not available
  const currentImageIndex = context ? context.getNextIndex() : 0;

  const isFirstImage = currentImageIndex === 1;
  const imageSrc = typeof props.src === "string" ? props.src : "";

  return (
    <Image
      src={imageSrc}
      alt={props.alt || ""}
      width={800}
      height={600}
      className="rounded-lg"
      // First image: priority loading (preload, high priority)
      // Other images: eager loading (load immediately, but after first)
      priority={isFirstImage}
      loading={isFirstImage ? undefined : "eager"}
      quality={90}
      style={{ width: "100%", height: "auto" }}
    />
  );
}
