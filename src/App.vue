<template>
  <div id="app">
    <div id="charts">
      <line-chart :msg="$store.state.msg"/>
      <line-chart :msg="$store.state.msg"/>
    </div>
  </div>
</template>

<script>
import LineChart from "./components/LineChart.vue";

export default {
  name: "app",
  components: {
    LineChart
  },
  data() {
    return {
      msg: "hey what's up"
    };
  }
};
</script>

<style>
:root {
  --main-bg-color: #fff;
}

html,
input,
select {
  background-color: var(--main-bg-color);
}

[v-cloak] {
  visibility: hidden;
}

body {
  width: 100%;
  margin: auto;
  overflow-x: hidden;
}

/* tooltip */
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

#charts {
  display: flex;
  justify-content: space-between;
  margin-left: 3%;
}

/* axis formatting */
.gridlines .domain {
  display: none;
  opacity: 0;
}

.gridlines {
  opacity: 0.3;
  /* stroke-dasharray: 2; */
}
#chart .domain {
  opacity: 0;
}
.y-axis .tick line,
.x-axis .tick line {
  opacity: 0;
}
.x-axis {
  height: 100px;
}
.grid .tick line {
  stroke: #707070;
  opacity: 0.3;
}
</style>
