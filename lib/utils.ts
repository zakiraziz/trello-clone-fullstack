import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges them with tailwind-merge
 * to avoid style conflicts in Tailwind CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Conditional class name helper that returns the class if the condition is true.
 * @param condition - Boolean condition
 * @param className - Class to apply if condition is true
 * @param fallback - Optional class to apply if condition is false
 */
export function ifClass(
  condition: boolean,
  className: string,
  fallback: string = ""
): string {
  return condition ? className : fallback
}

/**
 * Creates a variant system for components with Tailwind classes.
 * @param base - Base classes
 * @param variants - Variant configuration
 * @param defaultVariants - Default variant values
 */
export function variantProps<
  T extends Record<string, Record<string, string>>
>(
  base: string,
  variants: T,
  defaultVariants?: { [K in keyof T]?: keyof T[K] }
) {
  return (props: {
    [K in keyof T]?: keyof T[K]
  } & { className?: string }) => {
    const variantClasses = Object.keys(variants).map((variant) => {
      const variantValue = props[variant] || defaultVariants?.[variant]
      return variantValue ? variants[variant][variantValue] : ""
    })

    return cn(base, ...variantClasses, props.className)
  }
}

/**
 * Creates animation delay classes for staggered animations.
 * @param count - Number of items to generate delays for
 * @param step - Delay increment in milliseconds (default: 100ms)
 * @param prefix - Tailwind delay prefix (default: 'delay-')
 */
export function staggerDelays(
  count: number,
  step: number = 100,
  prefix: string = "delay-"
): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}${i * step}`)
}

/**
 * Generates responsive grid column classes based on item count.
 * @param count - Number of grid items
 * @param minWidth - Minimum width for each item (default: 'min-w-[200px]')
 */
export function gridCols(
  count: number,
  minWidth: string = "min-w-[200px]"
): string {
  return cn(
    "grid",
    `grid-cols-${Math.min(count, 4)}`, // Up to 4 columns
    `md:grid-cols-${Math.min(count, 6)}`, // Up to 6 columns on medium screens
    `lg:grid-cols-${Math.min(count, 8)}`, // Up to 8 columns on large screens
    minWidth,
    "gap-4"
  )
}

/**
 * Creates a set of focus-visible classes for better accessibility.
 */
export function focusVisibleClasses(
  ringColor: string = "ring-blue-500",
  offset: string = "ring-offset-2"
): string {
  return cn(
    "focus:outline-none",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    ringColor,
    offset
  )
}

/**
 * Creates a set of classes for a smooth transition.
 * @param properties - CSS properties to transition (default: 'all')
 * @param duration - Transition duration (default: '300')
 * @param easing - Transition timing function (default: 'ease-in-out')
 */
export function transitionClasses(
  properties: string = "all",
  duration: string = "300",
  easing: string = "ease-in-out"
): string {
  return cn(
    `transition-${properties}`,
    `duration-${duration}`,
    `ease-${easing}`
  )
}

/**
 * Creates a set of classes for truncating text with ellipsis.
 * @param lines - Number of lines to show before truncating
 */
export function truncateClasses(lines: number = 1): string {
  if (lines === 1) {
    return cn("truncate")
  }
  return cn(
    "overflow-hidden",
    `line-clamp-${lines}`,
    "text-ellipsis",
    "break-words"
  )
}
