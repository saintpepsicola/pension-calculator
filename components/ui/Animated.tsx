import { motion } from "framer-motion"
import React from "react"
import { MotionComponent } from "@/lib/types"

function createAnimatedComponent<T extends MotionComponent>(Component: T) {
  const AnimatedComponent = React.forwardRef<
    React.ElementRef<T>,
    React.ComponentProps<T>
  >((props, ref) => {
    const MotionComponent = Component as React.ElementType

    return (
      <MotionComponent
        ref={ref}
        initial={props.initial ?? { opacity: 0, y: 15 }}
        animate={props.animate ?? { opacity: 1, y: 0 }}
        transition={props.transition ?? { duration: 0.5, ease: "easeOut" }}
        {...props}
      />
    )
  })

  const componentName =
    (Component as any).displayName || (Component as any).name || "Component"
  AnimatedComponent.displayName = `Animated(${componentName})`

  return AnimatedComponent
}

export const AnimatedDiv = createAnimatedComponent(motion.div)
export const AnimatedHeader = createAnimatedComponent(motion.h1)
export const AnimatedParagraph = createAnimatedComponent(motion.p)
