import { visualizer } from "rollup-plugin-visualizer";

export default {
  plugins: [
    visualizer({
      open: true
    })
  ]
}