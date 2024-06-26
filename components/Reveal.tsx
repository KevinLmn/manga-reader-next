import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
interface Props {
  children: JSX.Element;
  width?: "fit-content" | "100%";
}

export const Reveal = ({ children, width = "fit-content" }: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView]);

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: {
            x: "-100%",
            opacity: 0,
          },
          visible: {
            x: 0,
            opacity: 1,
          },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
