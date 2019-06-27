<template>
  <div>
    <slot name="content">
      <h1>I'm the default content</h1>
    </slot>
  </div>
</template>

<script>
export default {
  name: "tooltip",
  props: ["filteredData"],
  data() {
    return {
      tooltip: {
        element: null,
        init: function() {
          this.element = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        },
        show: function(t) {
          this.element
            .html(t)
            .transition()
            .duration(200)
            .style(
              "left",
              `${
                event.clientX > window.innerWidth * 0.5
                  ? event.clientX - this.element._groups[0][0].clientWidth - 10
                  : event.clientX + 10
              }px`
            )
            .style("top", `${event.clientY + 10}px`)
            .style("opacity", 0.925);
        },
        move: function() {
          this.element
            .transition()
            .duration(30)
            .style(
              "left",
              `${
                event.clientX > window.innerWidth * 0.5
                  ? event.clientX - this.element._groups[0][0].clientWidth - 10
                  : event.clientX + 10
              }px`
            )
            .style("top", `${event.clientY + 10}px`)
            .style("opacity", 0.925);
        },
        hide: function() {
          this.element
            .transition()
            .duration(500)
            .style("opacity", 0)
            .delay(100);
        }
      }
    };
  },
  mounted() {
    this.tooltip.init();
  }
};
</script>

<style scoped>
div.tooltip {
  position: fixed;
  max-width: 350px;
  text-align: left;
  /* display: inline; */
  padding: 10px;
  font-size: 1.5rem;
  /* font-size: 1rem; */
  line-height: 1.2;
  background-color: #fff;
  border: 0px;
  border-radius: 6px;
  pointer-events: none;
  color: var(--main-body-type);
  filter: drop-shadow(0px 2px 8px rgba(59, 59, 61, 0.4));
  z-index: 1;
}
</style>